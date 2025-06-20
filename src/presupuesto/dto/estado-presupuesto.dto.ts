import { IsEnum, IsNumber } from "class-validator";
import { estadoPresupuestoList } from "../enum/estado-presupuesto";
import { EstadoPresupuesto } from "@prisma/client";

export class EstadoPresupuestoDto{

    @IsEnum(estadoPresupuestoList, {
        message: `Valid status are: ${estadoPresupuestoList}`
    })
    estado: EstadoPresupuesto;
}