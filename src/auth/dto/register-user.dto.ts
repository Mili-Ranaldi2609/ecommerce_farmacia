import { UserType, Rol } from '@prisma/client';
import { IsBoolean, IsEmail, IsEnum, IsNumber, IsString, IsStrongPassword } from 'class-validator';
import { RolList } from '../enums/rol.enum';
import { userTypeList } from '../enums/userType.enum';

export class RegisterUserDto {

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword()
  password: string;

  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsString()
  direccion: string;

  @IsBoolean()
  available: boolean;

  @IsString()
  fechaNacimiento: string;

  @IsString()
  sexo: string;

  @IsString()
  telefono: string;

  @IsString()
  urlImagen: string;

  @IsEnum(userTypeList, {
    message: `Valid Roles are: ${userTypeList}`,
  })
  userType: UserType;

  @IsEnum(RolList, {
    message: `Valid Roles are: ${RolList}`,
  })
  rol: Rol;
}
