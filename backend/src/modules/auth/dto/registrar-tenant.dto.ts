import { IsEmail, IsString, Length, Matches, MinLength } from 'class-validator';

export class RegistrarTenantDto {
  @IsString()
  @Length(2, 150)
  nombreTenant!: string;

  // Solo letras minúsculas, números y guiones. Ej: "mi-lavadero"
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'El slug solo puede tener letras minúsculas, números y guiones',
  })
  @Length(2, 50)
  slug!: string;

  @IsString()
  @Length(2, 100)
  nombre!: string;

  @IsString()
  @Length(2, 100)
  apellido!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
