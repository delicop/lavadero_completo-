import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { TipoVehiculo } from '../entities/vehiculo.entity';

export class ActualizarVehiculoDto {
  @IsString()
  @IsOptional()
  @Length(1, 10)
  placa?: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  marca?: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  modelo?: string;

  @IsString()
  @IsOptional()
  @Length(1, 30)
  color?: string;

  @IsEnum(TipoVehiculo)
  @IsOptional()
  tipo?: TipoVehiculo;
}
