import { IsOptional, IsString, MaxLength, IsEmail } from 'class-validator';

export class ActualizarConfigTenantDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombreComercial?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  logo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  zonaHoraria?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  moneda?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefonoWhatsapp?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  emailContacto?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  direccion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(7)
  colorPrimario?: string;

  @IsOptional()
  @IsString()
  @MaxLength(7)
  colorSidebar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(7)
  colorFondo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(7)
  colorSuperficie?: string;
}
