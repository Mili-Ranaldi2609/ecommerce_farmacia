import { IsEnum, IsOptional } from "class-validator";
import { PaginationDto } from "../../common";
import { EstadoPedidoList } from "../enum/estadoPedido.enum";
import { Estados } from "@prisma/client";

export class PedidoPaginationDto extends PaginationDto {
    
    @IsOptional()
    @IsEnum(EstadoPedidoList, {
        message: `Valid status are: ${EstadoPedidoList}`
    })
    estado: Estados
}