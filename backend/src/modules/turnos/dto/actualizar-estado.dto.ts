import { IsEnum } from 'class-validator';
import { EstadoTurno } from '../entities/turno.entity';

export class ActualizarEstadoDto {
  @IsEnum(EstadoTurno)
  estado!: EstadoTurno;
}
