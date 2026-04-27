import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CambiarPasswordDto {
  @IsString()
  @IsNotEmpty()
  passwordActual!: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#])[A-Za-z\d@$!%*?&_\-#]{8,}$/, {
    message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo (@$!%*?&_-#)',
  })
  passwordNueva!: string;
}
