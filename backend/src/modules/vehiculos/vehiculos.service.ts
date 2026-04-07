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

  async crear(dto: CrearVehiculoDto): Promise<Vehiculo> {
    await this.clientesService.buscarPorId(dto.clienteId);

    const existe = await this.repo.findOne({ where: { placa: dto.placa } });
    if (existe) {
      throw new ConflictException(`Ya existe un vehículo con la placa ${dto.placa}`);
    }

    const vehiculo = this.repo.create(dto);
    return this.repo.save(vehiculo);
  }

  async buscarTodos(): Promise<Vehiculo[]> {
    return this.repo.find({
      relations: ['cliente'],
      order: { fechaRegistro: 'DESC' },
    });
  }

  async buscarPorId(id: string): Promise<Vehiculo> {
    const vehiculo = await this.repo.findOne({
      where: { id },
      relations: ['cliente'],
    });
    if (!vehiculo) {
      throw new NotFoundException(`Vehículo con id ${id} no encontrado`);
    }
    return vehiculo;
  }

  async buscarPorCliente(clienteId: string): Promise<Vehiculo[]> {
    await this.clientesService.buscarPorId(clienteId);
    return this.repo.find({
      where: { clienteId },
      order: { marca: 'ASC' },
    });
  }

  async actualizar(id: string, dto: ActualizarVehiculoDto): Promise<Vehiculo> {
    const vehiculo = await this.buscarPorId(id);

    if (dto.placa && dto.placa !== vehiculo.placa) {
      const existe = await this.repo.findOne({ where: { placa: dto.placa } });
      if (existe) {
        throw new ConflictException(`Ya existe un vehículo con la placa ${dto.placa}`);
      }
    }

    Object.assign(vehiculo, dto);
    return this.repo.save(vehiculo);
  }

  async eliminar(id: string): Promise<void> {
    const vehiculo = await this.buscarPorId(id);
    await this.repo.remove(vehiculo);
  }
}
