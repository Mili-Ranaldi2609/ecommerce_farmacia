import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateProveedoreDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  nombre: string;

  @IsString()
  @IsEmail({}, { message: 'El email debe tener un formato válido.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'El teléfono no puede estar vacío.' })
  telefono: string;
}
