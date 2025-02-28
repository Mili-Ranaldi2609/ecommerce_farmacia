import { IsEnum, IsOptional } from "class-validator";
import { PaginationDto } from "../../common";
import { EstadoPagosList } from "../enum/estadoPago.enum";
import { EstadoPagos } from "@prisma/client";

export class PagoPaginationDto extends PaginationDto {

    @IsOptional()
    @IsEnum(EstadoPagosList, {
        message: `Valid status are: ${EstadoPagosList}`
    })
    estado: EstadoPagos;
}