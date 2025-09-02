import { ArrayMinSize, IsArray, IsDate, IsEnum, IsNumber, IsOptional, IsPositive, ValidateNested } from "class-validator";
import { DetallePedidoDto } from "./detalle-pedido.dto";
import { Type } from "class-transformer";
import { Estados } from "@prisma/client";
import { EstadoPedidoList } from "../enum/estadoPedido.enum";


export class CreatePedidoDto {

    @IsDate()
    @IsOptional()
    fechaPedido?: Date;
    
    @IsNumber()
    @IsPositive()
    usuarioId: number;

    @IsEnum(EstadoPedidoList, {
        message: `Valid status are: ${EstadoPedidoList}`
    })
    @IsOptional()
    estado: Estados;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type( () => DetallePedidoDto)
    detallesPedidos: DetallePedidoDto[]
}
