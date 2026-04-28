import { IsEmail, IsString, Length, Matches } from 'class-validator';

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
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#])[A-Za-z\d@$!%*?&_\-#]{8,}$/, {
    message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo (@$!%*?&_-#)',
  })
  password!: string;
}
