import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Servicio } from './entities/servicio.entity';
import { CrearServicioDto } from './dto/crear-servicio.dto';
import { ActualizarServicioDto } from './dto/actualizar-servicio.dto';

@Injectable()
export class ServiciosService {
  constructor(
    @InjectRepository(Servicio)
    private readonly repo: Repository<Servicio>,
  ) {}

  async crear(dto: CrearServicioDto): Promise<Servicio> {
    const existe = await this.repo.findOne({ where: { tipoVehiculo: dto.tipoVehiculo, nombre: dto.nombre } });
    if (existe) {
      throw new ConflictException(`Ya existe "${dto.nombre}" para el tipo "${dto.tipoVehiculo}"`);
    }

    const servicio = this.repo.create({
      ...dto,
      descripcion: dto.descripcion ?? null,
    });
    return this.repo.save(servicio);
  }

  async buscarTodos(soloActivos = false): Promise<Servicio[]> {
    const where = soloActivos ? { activo: true } : {};
    return this.repo.find({ where, order: { tipoVehiculo: 'ASC', nombre: 'ASC' } });
  }

  async buscarPorId(id: string): Promise<Servicio> {
    const servicio = await this.repo.findOne({ where: { id } });
    if (!servicio) {
      throw new NotFoundException(`Servicio con id ${id} no encontrado`);
    }
    return servicio;
  }

  async actualizar(id: string, dto: ActualizarServicioDto): Promise<Servicio> {
    const servicio = await this.buscarPorId(id);

    const nuevoTipo   = dto.tipoVehiculo ?? servicio.tipoVehiculo;
    const nuevoNombre = dto.nombre ?? servicio.nombre;
    if (nuevoTipo !== servicio.tipoVehiculo || nuevoNombre !== servicio.nombre) {
      const existe = await this.repo.findOne({ where: { tipoVehiculo: nuevoTipo, nombre: nuevoNombre } });
      if (existe) {
        throw new ConflictException(`Ya existe "${nuevoNombre}" para el tipo "${nuevoTipo}"`);
      }
    }

    Object.assign(servicio, dto);
    return this.repo.save(servicio);
  }

  async eliminar(id: string): Promise<void> {
    const servicio = await this.buscarPorId(id);
    await this.repo.remove(servicio);
  }
}
