import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehiculo } from './entities/vehiculo.entity';
import { ClientesService } from '../clientes/clientes.service';
import { CrearVehiculoDto } from './dto/crear-vehiculo.dto';
import { ActualizarVehiculoDto } from './dto/actualizar-vehiculo.dto';

@Injectable()
export class VehiculosService {
  constructor(
    @InjectRepository(Vehiculo)
    private readonly repo: Repository<Vehiculo>,
    private readonly clientesService: ClientesService,
  ) {}

  async crear(dto: CrearVehiculoDto, tenantId: string): Promise<Vehiculo> {
    await this.clientesService.buscarPorId(dto.clienteId, tenantId);

    const existe = await this.repo.findOne({ where: { placa: dto.placa, tenantId } });
    if (existe) {
      throw new ConflictException(`Ya existe un vehículo con la placa ${dto.placa}`);
    }

    const vehiculo = this.repo.create({ ...dto, tenantId });
    return this.repo.save(vehiculo);
  }

  async buscarTodos(tenantId: string): Promise<Vehiculo[]> {
    return this.repo.find({
      where: { tenantId },
      relations: ['cliente'],
      order: { fechaRegistro: 'DESC' },
    });
  }

  async buscarPorId(id: string, tenantId: string): Promise<Vehiculo> {
    const vehiculo = await this.repo.findOne({
      where: { id, tenantId },
      relations: ['cliente'],
    });
    if (!vehiculo) {
      throw new NotFoundException(`Vehículo con id ${id} no encontrado`);
    }
    return vehiculo;
  }

  async buscarPorPlaca(placa: string, tenantId: string): Promise<Vehiculo | null> {
    return this.repo.findOne({
      where: { placa: placa.toUpperCase(), tenantId },
      relations: ['cliente'],
    });
  }

  async buscarPorCliente(clienteId: string, tenantId: string): Promise<Vehiculo[]> {
    await this.clientesService.buscarPorId(clienteId, tenantId);
    return this.repo.find({
      where: { clienteId, tenantId },
      order: { marca: 'ASC' },
    });
  }

  async actualizar(id: string, dto: ActualizarVehiculoDto, tenantId: string): Promise<Vehiculo> {
    const vehiculo = await this.buscarPorId(id, tenantId);

    if (dto.placa && dto.placa !== vehiculo.placa) {
      const existe = await this.repo.findOne({ where: { placa: dto.placa, tenantId } });
      if (existe) {
        throw new ConflictException(`Ya existe un vehículo con la placa ${dto.placa}`);
      }
    }

    Object.assign(vehiculo, dto);
    return this.repo.save(vehiculo);
  }

  async eliminar(id: string, tenantId: string): Promise<void> {
    const vehiculo = await this.buscarPorId(id, tenantId);
    await this.repo.remove(vehiculo);
  }
}
