import { IsArray, IsInt, IsString } from "class-validator";

export class CreateTiposUsoDto {

    @IsInt()
    public idProducto: number
  
    @IsString()
    public descripcion: string;

    @IsArray()
    public tiposDeUso: string[]

}
