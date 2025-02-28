import { EstadoPagos } from "@prisma/client";
import { IsEnum, IsNumber } from "class-validator";
import { EstadoPagosList } from "../enum/estadoPago.enum";

export class estadoPagoDto {
    
    @IsNumber()
    id: number;

    @IsEnum(EstadoPagosList, {
        message: `Valid status are: ${EstadoPagosList}`
    })
    estado: EstadoPagos;
}