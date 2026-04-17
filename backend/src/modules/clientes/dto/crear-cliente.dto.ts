import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoVehiculo } from '../../vehiculos/entities/vehiculo.entity';

export class VehiculoEnClienteDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 10)
  placa!: string;

  @IsEnum(TipoVehiculo)
  tipo!: TipoVehiculo;

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
}

export class CrearClienteDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  apellido!: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 20)
  telefono!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  cedula?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => VehiculoEnClienteDto)
  vehiculo?: VehiculoEnClienteDto;
}
