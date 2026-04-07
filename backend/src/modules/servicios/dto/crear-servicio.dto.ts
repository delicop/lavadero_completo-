import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Length, Min } from 'class-validator';

export class CrearServicioDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  nombre!: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsInt()
  @Min(1, { message: 'La duración debe ser al menos 1 minuto' })
  duracionMinutos!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive({ message: 'El precio debe ser mayor a cero' })
  precio!: number;
}
