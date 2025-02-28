import { EstadoPagos } from "@prisma/client";

export const EstadoPagosList = [
    EstadoPagos.EN_PROCESO,
    EstadoPagos.PAGO_CANCELADO,
    EstadoPagos.PAGO_RECHAZADO,
    EstadoPagos.PAGADO,
];

export enum PagoStatus {
    EN_PROCESO = 'EN_PROCESO',
    PAGO_CANCELADO = 'PAGO_CANCELADO',
    PAGO_RECHAZADO = 'PAGO_RECHAZADO',
    PAGADO = 'PAGADO',
}