import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UsuariosService } from '../usuarios/usuarios.service';
import { TenantsService } from '../tenants/tenants.service';
import { EventsGateway } from '../events/events.gateway';
import { LoginLog } from './entities/login-log.entity';
import { LoginDto } from './dto/login.dto';
import { CambiarPasswordDto } from './dto/cambiar-password.dto';
import { RegistrarTenantDto } from './dto/registrar-tenant.dto';
import { RolUsuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly tenantsService: TenantsService,
    private readonly jwtService: JwtService,
    private readonly eventsGateway: EventsGateway,
    @InjectRepository(LoginLog)
    private readonly loginLogRepo: Repository<LoginLog>,
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string; config: object }> {
    const usuario = await this.usuariosService.buscarPorEmailConPassword(dto.email);

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValida = await bcrypt.compare(dto.password, usuario.passwordHash);
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    await this.loginLogRepo.save(
      this.loginLogRepo.create({
        usuarioId: usuario.id,
        email:     usuario.email,
        nombre:    `${usuario.nombre} ${usuario.apellido}`,
        rol:       usuario.rol,
        tenantId:  usuario.tenantId,
      }),
    );

    const payload = { sub: usuario.id, rol: usuario.rol, tenantId: usuario.tenantId };
    const accessToken = this.jwtService.sign(payload);
    const tenant = await this.tenantsService.buscarPorId(usuario.tenantId!);
    const { id: _id, activo: _activo, fechaCreacion: _fc, ...config } = tenant;
    return { accessToken, config };
  }

  async obtenerConfigTenant(tenantId: string): Promise<object> {
    const tenant = await this.tenantsService.buscarPorId(tenantId);
    const { id: _id, activo: _activo, fechaCreacion: _fc, ...config } = tenant;
    return config;
  }

  async cambiarPassword(usuarioId: string, dto: CambiarPasswordDto): Promise<void> {
    const usuario = await this.usuariosService.buscarPorIdConPassword(usuarioId);
    if (!usuario) throw new UnauthorizedException('Usuario no encontrado');

    const valida = await bcrypt.compare(dto.passwordActual, usuario.passwordHash);
    if (!valida) throw new UnauthorizedException('La contraseña actual es incorrecta');

    const nuevoHash = await bcrypt.hash(dto.passwordNueva, 10);
    await this.usuariosService.actualizarPasswordHash(usuarioId, nuevoHash);
  }

  async actualizarDisponibilidad(usuarioId: string, disponible: boolean): Promise<void> {
    await this.usuariosService.actualizarDisponibilidad(usuarioId, disponible);
    this.eventsGateway.emitirUsuarioActualizado(usuarioId, disponible);
  }

  async registrar(dto: RegistrarTenantDto): Promise<{ accessToken: string }> {
    // Verificar que el slug no esté en uso
    const slugExiste = await this.tenantsService.buscarPorSlug(dto.slug);
    if (slugExiste) {
      throw new ConflictException(`El slug "${dto.slug}" ya está en uso`);
    }

    // Verificar que el email no esté en uso
    const emailExiste = await this.usuariosService.buscarPorEmailConPassword(dto.email);
    if (emailExiste) {
      throw new ConflictException('Ya existe una cuenta con ese email');
    }

    // Crear tenant
    const tenant = await this.tenantsService.crear(dto.nombreTenant, dto.slug);

    // Crear admin del tenant
    const admin = await this.usuariosService.crear(
      {
        nombre:             dto.nombre,
        apellido:           dto.apellido,
        email:              dto.email,
        password:           dto.password,
        rol:                RolUsuario.ADMIN,
        comisionPorcentaje: 0,
      },
      tenant.id,
    );

    // Login automático al terminar el registro
    const payload = { sub: admin.id, rol: admin.rol, tenantId: tenant.id };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async historialLogin(limit: number, tenantId: string): Promise<LoginLog[]> {
    return this.loginLogRepo.find({
      where: { tenantId },
      order: { fechaHora: 'DESC' },
      take:  limit,
    });
  }
}
