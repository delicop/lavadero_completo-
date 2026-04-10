import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsString, MaxLength, Min } from 'class-validator';
import { TipoPagoCaja } from '../entities/gasto-caja.entity';

export class RegistrarIngresoManualDto {
  @IsString()
  @MaxLength(200)
  concepto!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  monto!: number;

  @IsEnum(TipoPagoCaja)
  tipoPago!: TipoPagoCaja;
}
