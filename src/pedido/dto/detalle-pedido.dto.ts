import { IsNumber, IsOptional, IsPositive } from "class-validator";

export class DetallePedidoDto {

    @IsNumber()
    @IsPositive()
    productoId: number;

    @IsNumber()
    @IsPositive()
    cantidad: number;
}