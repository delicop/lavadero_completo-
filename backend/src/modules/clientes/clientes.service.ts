import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly repo: Repository<Cliente>,
  ) {}

  async crear(dto: CrearClienteDto): Promise<Cliente> {
    if (dto.email) {
      const existe = await this.repo.findOne({ where: { email: dto.email } });
      if (existe) {
        throw new ConflictException('Ya existe un cliente con ese email');
      }
    }

    const cliente = this.repo.create({
      ...dto,
      email: dto.email ?? null,
    });
    return this.repo.save(cliente);
  }

  async buscarTodos(): Promise<Cliente[]> {
    return this.repo.find({ order: { apellido: 'ASC', nombre: 'ASC' } });
  }

  async buscarPorId(id: string): Promise<Cliente> {
    const cliente = await this.repo.findOne({ where: { id } });
    if (!cliente) {
      throw new NotFoundException(`Cliente con id ${id} no encontrado`);
    }
    return cliente;
  }

  async actualizar(id: string, dto: ActualizarClienteDto): Promise<Cliente> {
    const cliente = await this.buscarPorId(id);

    if (dto.email && dto.email !== cliente.email) {
      const existe = await this.repo.findOne({ where: { email: dto.email } });
      if (existe) {
        throw new ConflictException('Ya existe un cliente con ese email');
      }
    }

    Object.assign(cliente, dto);
    return this.repo.save(cliente);
  }

  async eliminar(id: string): Promise<void> {
    const cliente = await this.buscarPorId(id);
    await this.repo.remove(cliente);
  }
}
