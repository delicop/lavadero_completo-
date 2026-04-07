import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class ActualizarTurnoDto {
  @IsUUID()
  @IsOptional()
  trabajadorId?: string;

  @IsDateString()
  @IsOptional()
  fechaHora?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
