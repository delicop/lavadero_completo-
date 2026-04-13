import { IsBoolean, IsInt, IsNumber, IsOptional, IsPositive, IsString, Length, Min } from 'class-validator';

export class ActualizarServicioDto {
  @IsString()
  @IsOptional()
  @Length(1, 50)
  tipoVehiculo?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  nombre?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  duracionMinutos?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  precio?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
