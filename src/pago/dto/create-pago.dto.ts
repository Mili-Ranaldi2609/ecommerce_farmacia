import { EstadoPagos } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";
import { EstadoPagosList } from "../enum/estadoPago.enum";



export class PagoDto {
    
    @IsString()
    @IsNotEmpty()
    metodoPago: string;

    @IsEnum(EstadoPagosList, {
        message: `Valid status are: ${EstadoPagosList}`
    })
    @IsOptional()
    estado: EstadoPagos;

    @IsNumber()
    @IsPositive()
    usuario: number;

    @IsNumber()
    @IsPositive()
    pedido: number;
}