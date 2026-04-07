import { IsEnum, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';
import { MetodoPago } from '../entities/factura.entity';

export class CrearFacturaDto {
  @IsUUID()
  turnoId!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  total!: number;

  @IsEnum(MetodoPago)
  metodoPago!: MetodoPago;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
