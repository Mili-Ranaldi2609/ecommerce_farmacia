import { EstadoSolicitud } from "@prisma/client";
import { IsEnum, IsNumber } from "class-validator";
import { estadoSolicitudList } from "../enum/estado-solicitud.estado";

export class EstadoSolicitudDto{
    
    @IsNumber()
    id: number;

    @IsEnum(estadoSolicitudList,{
        message: `Valid status are: ${estadoSolicitudList}`
    })
    estado: EstadoSolicitud
}