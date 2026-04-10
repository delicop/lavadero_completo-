import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class ActualizarClienteDto {
  @IsString()
  @IsOptional()
  @Length(1, 100)
  nombre?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  apellido?: string;

  @IsString()
  @IsOptional()
  @Length(6, 20)
  telefono?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  cedula?: string;
}
