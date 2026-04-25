import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CrearLogFrontendDto {
  @IsString()
  @MaxLength(500)
  mensaje!: string;

  @IsOptional()
  @IsString()
  detalle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  ruta?: string;
}
