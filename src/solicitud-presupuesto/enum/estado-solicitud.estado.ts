import { EstadoSolicitud } from "@prisma/client";

export const estadoSolicitudList = [
    EstadoSolicitud.CREADA,
    EstadoSolicitud.ACEPTADA,
    EstadoSolicitud.CANCELADA,
    EstadoSolicitud.RECHAZADA,
    EstadoSolicitud.FINALIZADA,
]