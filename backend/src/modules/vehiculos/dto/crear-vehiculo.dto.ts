import { IsEnum, IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';
import { TipoVehiculo } from '../entities/vehiculo.entity';

export class CrearVehiculoDto {
  @IsUUID()
  clienteId!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 10)
  placa!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  marca!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  modelo!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 30)
  color!: string;

  @IsEnum(TipoVehiculo)
  tipo!: TipoVehiculo;
}
