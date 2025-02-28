
import { IsArray, IsInt, IsString } from "class-validator";

export class CreateDescripcionDto {
    @IsInt()
    public idProducto: number
  
    @IsString()
    public descripcion: string;
  
    @IsArray()
    public caracteristicas: string[];
}
