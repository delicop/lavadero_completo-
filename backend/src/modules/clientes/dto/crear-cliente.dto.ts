import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CrearClienteDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  apellido!: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 20)
  telefono!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  cedula?: string;
}
