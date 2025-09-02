import { Estados } from "@prisma/client";
import { IsEnum, IsNumber } from "class-validator";
import { EstadoPedidoList } from "../enum/estadoPedido.enum";


export class estadoDto {

    @IsEnum(EstadoPedidoList, {
        message: `Valid status are: ${EstadoPedidoList}`
    })
    estado: Estados
}