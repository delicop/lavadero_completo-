import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from './entities/usuario.entity';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly repo: Repository<Usuario>,
  ) {}

  async crear(dto: CrearUsuarioDto): Promise<Omit<Usuario, 'passwordHash'>> {
    const existe = await this.repo.findOne({ where: { email: dto.email } });
    if (existe) {
      throw new ConflictException('Ya existe un usuario con ese email');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const usuario = this.repo.create({ ...dto, passwordHash });
    const guardado = await this.repo.save(usuario);

    return this.omitirPassword(guardado);
  }

  async buscarTodos(): Promise<Omit<Usuario, 'passwordHash'>[]> {
    const usuarios = await this.repo.find({ order: { fechaRegistro: 'DESC' } });
    return usuarios.map((u) => this.omitirPassword(u));
  }

  async buscarPorId(id: string): Promise<Omit<Usuario, 'passwordHash'>> {
    const usuario = await this.repo.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return this.omitirPassword(usuario);
  }

  async buscarPorEmailConPassword(email: string): Promise<Usuario | null> {
    return this.repo.findOne({ where: { email } });
  }

  async buscarPorIdConPassword(id: string): Promise<Usuario | null> {
    return this.repo.findOne({ where: { id } });
  }

  async actualizarPasswordHash(id: string, hash: string): Promise<void> {
    await this.repo.update(id, { passwordHash: hash });
  }

  async actualizarDisponibilidad(id: string, disponible: boolean): Promise<void> {
    await this.repo.update(id, { disponible });
  }

  async actualizar(
    id: string,
    dto: ActualizarUsuarioDto,
  ): Promise<Omit<Usuario, 'passwordHash'>> {
    const usuario = await this.repo.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    if (dto.password) {
      usuario.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    Object.assign(usuario, {
      nombre: dto.nombre ?? usuario.nombre,
      apellido: dto.apellido ?? usuario.apellido,
      rol: dto.rol ?? usuario.rol,
      activo: dto.activo ?? usuario.activo,
      comisionPorcentaje: dto.comisionPorcentaje ?? usuario.comisionPorcentaje,
    });

    const actualizado = await this.repo.save(usuario);
    return this.omitirPassword(actualizado);
  }

  async eliminar(id: string): Promise<void> {
    const usuario = await this.repo.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    await this.repo.remove(usuario);
  }

  private omitirPassword(usuario: Usuario): Omit<Usuario, 'passwordHash'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...resto } = usuario;
    return resto;
  }
}
