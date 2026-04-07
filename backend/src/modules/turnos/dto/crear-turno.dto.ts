import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CrearTurnoDto {
  @IsUUID()
  clienteId!: string;

  @IsUUID()
  vehiculoId!: string;

  @IsUUID()
  servicioId!: string;

  @IsUUID()
  trabajadorId!: string;

  @IsDateString()
  fechaHora!: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  observaciones?: string;
}
