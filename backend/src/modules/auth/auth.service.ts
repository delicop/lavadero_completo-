import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UsuariosService } from '../usuarios/usuarios.service';
import { EventsGateway } from '../events/events.gateway';
import { LoginLog } from './entities/login-log.entity';
import { LoginDto } from './dto/login.dto';
import { CambiarPasswordDto } from './dto/cambiar-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    private readonly eventsGateway: EventsGateway,
    @InjectRepository(LoginLog)
    private readonly loginLogRepo: Repository<LoginLog>,
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const usuario = await this.usuariosService.buscarPorEmailConPassword(dto.email);

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValida = await bcrypt.compare(dto.password, usuario.passwordHash);
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Registrar historial de login
    await this.loginLogRepo.save(
      this.loginLogRepo.create({
        usuarioId: usuario.id,
        email:     usuario.email,
        nombre:    `${usuario.nombre} ${usuario.apellido}`,
        rol:       usuario.rol,
      }),
    );

    const payload = { sub: usuario.id, rol: usuario.rol };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
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

  async historialLogin(limit: number): Promise<LoginLog[]> {
    return this.loginLogRepo.find({
      order: { fechaHora: 'DESC' },
      take:  limit,
    });
  }
}
