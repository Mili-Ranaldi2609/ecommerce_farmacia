import { Estados } from "@prisma/client" 

export const EstadoPedidoList = [
    Estados.EN_CARRITO,
    Estados.EN_PROCESO,
    Estados.EN_ESPERA_PAGO,
    Estados.COMPRADO,
    Estados.CANCELADO,
    Estados.PAGO_RECHAZADO,
]