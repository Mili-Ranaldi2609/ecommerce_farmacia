// src/tipos-uso/dto/create-tipos-uso.dto.ts
import { IsArray, IsInt, IsString, IsNotEmpty } from "class-validator";

export class CreateTiposUsoDto {
    @IsInt()
    @IsNotEmpty() 
    public idProducto: number;
    
    @IsString()
    @IsNotEmpty() 
    public nombre: string; 
    @IsString()
    @IsNotEmpty() // Asumo que descripcion es requerida al crear
    public descripcion: string;

    @IsArray()
    @IsNotEmpty() // Asumo que tiposDeUso es requerido al crear
    public tiposDeUso: string[];
}