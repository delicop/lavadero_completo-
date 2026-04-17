import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { Vehiculo } from '../vehiculos/entities/vehiculo.entity';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly repo: Repository<Cliente>,
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepo: Repository<Vehiculo>,
  ) {}

  async crear(dto: CrearClienteDto, tenantId: string): Promise<Cliente> {
    if (dto.email) {
      const existe = await this.repo.findOne({ where: { email: dto.email, tenantId } });
      if (existe) {
        throw new ConflictException('Ya existe un cliente con ese email');
      }
    }

    const cliente = this.repo.create({
      nombre:   dto.nombre,
      apellido: dto.apellido,
      telefono: dto.telefono,
      email:    dto.email   ?? null,
      cedula:   dto.cedula  ?? null,
      tenantId,
    });
    const clienteGuardado = await this.repo.save(cliente);

    if (dto.vehiculo) {
      const vehiculo = this.vehiculoRepo.create({
        ...dto.vehiculo,
        placa:     dto.vehiculo.placa.toUpperCase(),
        clienteId: clienteGuardado.id,
        tenantId,
      });
      await this.vehiculoRepo.save(vehiculo);
    }

    return clienteGuardado;
  }

  async buscarTodos(tenantId: string): Promise<Cliente[]> {
    return this.repo.find({
      where: { tenantId },
      order: { apellido: 'ASC', nombre: 'ASC' },
    });
  }

  async buscarPorId(id: string, tenantId: string): Promise<Cliente> {
    const cliente = await this.repo.findOne({ where: { id, tenantId } });
    if (!cliente) {
      throw new NotFoundException(`Cliente con id ${id} no encontrado`);
    }
    return cliente;
  }

  async actualizar(id: string, dto: ActualizarClienteDto, tenantId: string): Promise<Cliente> {
    const cliente = await this.buscarPorId(id, tenantId);

    if (dto.email && dto.email !== cliente.email) {
      const existe = await this.repo.findOne({ where: { email: dto.email, tenantId } });
      if (existe) {
        throw new ConflictException('Ya existe un cliente con ese email');
      }
    }

    Object.assign(cliente, dto);
    return this.repo.save(cliente);
  }

  async eliminar(id: string, tenantId: string): Promise<void> {
    const cliente = await this.buscarPorId(id, tenantId);
    await this.repo.remove(cliente);
  }
}
