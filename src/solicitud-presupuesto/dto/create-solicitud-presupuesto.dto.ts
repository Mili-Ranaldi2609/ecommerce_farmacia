import { Type } from "class-transformer";
import { IsNumber, IsPositive, IsString } from "class-validator";

export class CreateSolicitudPresupuestoDto {

    @IsString()
    public descripcion: string

    @IsNumber()
    @IsPositive()
    public cantidad: number

    @IsNumber()
    @IsPositive()
     @Type(() => Number)
    public productoId: number;

    @IsNumber()
    @IsPositive()
    public userId: number;
    
}
