import { Rol, UserType } from "@prisma/client";
import { IsBoolean, IsEnum, IsNumber, IsString } from "class-validator";
import { RolList } from "../enums/rol.enum";
import { userTypeList } from "../enums/userType.enum";

export class ClientUser {

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

    @IsEnum(userTypeList,{
        message: `Valid Roles are: ${userTypeList}`
    })
    userType: UserType;

    @IsEnum(RolList,{
        message: `Valid Roles are: ${RolList}`
    })
    rol: Rol;

    @IsNumber()
    userId: number;
}