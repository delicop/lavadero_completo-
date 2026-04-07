import { IsDateString, IsUUID } from 'class-validator';

export class CrearLiquidacionDto {
  @IsUUID()
  trabajadorId!: string;

  @IsDateString()
  fechaDesde!: string;

  @IsDateString()
  fechaHasta!: string;
}
