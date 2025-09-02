import { HttpException, HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EstadoPagos, Estados } from '@prisma/client';
import { estadoPagoDto, PagoDto, PagoPaginationDto, } from './dto';
import { prisma } from '../prisma/prisma-client';

@Injectable()
export class PagoService {

    private readonly logger = new Logger('PagoService')

    constructor(
    ) {}

    async create(createPagoDto: PagoDto) {
        try {
            const id = createPagoDto.usuario;

            //1. Confirmar el id del Usuario
            const usuario: any = await prisma.user.findFirst({
                where: {id: id, }
            })

            if(!usuario) {
                throw new HttpException(`User with id ${id} not found`, HttpStatus.NOT_FOUND);
            }

            //2. Confirmar el id del Pedido
            const pedidoId = parseInt(createPagoDto.pedido.toString());

            const pedido: any = await prisma.pedido.findFirst({
                where: {id: pedidoId, available: true},
                include: {detallesPedidos: {
                    select: {
                        precio: true,
                        cantidad: true,
                        productoId: true,
                    }
                }}
            })

            if(!pedido) {
                throw new HttpException(`Pedido with id ${pedidoId} not found`, HttpStatus.NOT_FOUND);
            }

            //3. Setear valor total extraido del pedido
            const montoTotal = pedido.totalAmount;

            //4. Crear una transaccion en la base de datos
            const pago = await prisma.pago.create({
                data: {
                    monto: montoTotal,
                    metodoPago: createPagoDto.metodoPago,
                    usuario: id,
                    pedidoId: pedidoId,    
                }
            });

            const historial = await prisma.historialEstadosPago.create({
                data: {
                    estado: pago.estado,
                    pagoId: pago.id,
                }
            });

            const changeEstadoPedido = await prisma.pedido.update({
                where: {id : pedidoId},
                data: {
                  estado: "EN_ESPERA_PAGO"
                }
            });


            const pedido2: any = await prisma.pedido.findFirst({
                where: {id: pedidoId, available: true},
                include: {detallesPedidos: {
                    select: {
                        precio: true,
                        cantidad: true,
                        productoId: true,
                    }
                }}
            })

            return {...pago,
                usuario: usuario,
                pedido: pedido2,
            }
            
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findAll(pagoPaginationDto: PagoPaginationDto) {
        const totalPages = await prisma.pago.count({
            where: {
                estado: pagoPaginationDto.estado
            }
        });

        const { page = 1, limit = 10 } = pagoPaginationDto;

        const currentPage = page;
        const perPage = limit;

        return {
            data: await prisma.pago.findMany({
                skip: (currentPage - 1) * perPage,
                take: perPage,
                where: {
                    estado: pagoPaginationDto.estado,
                    available: true,
                },
            }),
            meta: {
                total: totalPages,
                page: currentPage,
                lastPage: Math.ceil(totalPages / perPage),
            }
        }
    }

    async findOne(id: number) {

        const pago = await prisma.pago.findFirst({
            where: {id: id, available: true},
            include: {pedido: {
                include: {detallesPedidos: {
                    select: {
                        precio: true,
                        cantidad: true,
                        productoId: true,
                    }
                }}
            }}
        });

        if(!pago) {
            throw new HttpException(`Pago with id ${id} not found`, HttpStatus.NOT_FOUND);
        }

        const idUsuario = parseInt(pago.usuario.toString());
        const usuario: any = await prisma.user.findFirst({
            where: {id: idUsuario, }
        })

        if(!usuario) {
            throw new HttpException(`User with id ${idUsuario} not found`, HttpStatus.NOT_FOUND);
        }

        return {...pago,
            usuario: usuario,
        }
    }

    async remove(id: number) {
        await this.findOne(id);

        const pago = await prisma.pago.update({
            where: {id: id},
            data: {available: false},
        });

        return pago;
    }

    async changeEstadoPago({ id, estado }: estadoPagoDto) {
    // 1) Traigo el pago básico para saber su pedidoId y estado actual
    const pagoActual = await prisma.pago.findFirst({
      where: { id, available: true },
    });

    if (!pagoActual) {
      throw new HttpException(`Pago with id ${id} not found`, HttpStatus.NOT_FOUND);
    }

    if (pagoActual.estado === estado) {
      // ya está en el estado pedido
      return this.findOne(id);
    }

    // 2) Registro historial de estados del pago
    await prisma.historialEstadosPago.create({
      data: { estado, pagoId: id },
    });

    // 3) Si cambió el estado del pago, actualizo el pedido asociado
    //    (usá un mapeo válido a tu enum de pedido)
    const pedidoId = pagoActual.pedidoId;

    // Mapeo recomendado: AJUSTALO a tu enum real de Pedido (Estados)
    const mapPagoToPedido: Partial<Record<EstadoPagos, Estados>> = {
      [EstadoPagos.PAGADO]: Estados.COMPRADO,
      [EstadoPagos.PAGO_RECHAZADO]: Estados.PAGO_RECHAZADO, // si tu enum es RECHAZADO, cambialo aquí
      [EstadoPagos.PAGO_CANCELADO]: Estados.CANCELADO,
    };

    const nuevoEstadoPedido = mapPagoToPedido[estado];

    if (nuevoEstadoPedido) {
      await prisma.historialEstados.create({
        data: { estado: nuevoEstadoPedido, pedidoId },
      });

      await prisma.pedido.update({
        where: { id: pedidoId },   // <— clave: usar pedidoId
        data: { estado: nuevoEstadoPedido },
      });
    }

    // 4) Actualizo el estado del pago
    const pagoNuevo = await prisma.pago.update({
      where: { id },
      data: { estado },
    });

    // 5) Armo la respuesta con usuario y pedido
    const usuarioX = await prisma.user.findFirst({ where: { id: pagoNuevo.usuario } });
    if (!usuarioX) {
      throw new HttpException(`User with id ${pagoNuevo.usuario} not found`, HttpStatus.NOT_FOUND);
    }

    const pedidoX = await prisma.pedido.findFirst({
      where: { id: pagoNuevo.pedidoId, available: true },
      include: {
        detallesPedidos: { select: { precio: true, cantidad: true, productoId: true } },
      },
    });

    if (!pedidoX) {
      throw new HttpException(`Pedido with id ${pagoNuevo.pedidoId} not found`, HttpStatus.NOT_FOUND);
    }

    return { ...pagoNuevo, pedido: pedidoX, usuario: usuarioX };
  }

    async getAllEstadosPago(id: number) {
        const historial = await prisma.historialEstadosPago.findMany({
            where: {pagoId: id},
            orderBy: {fechaModificacion: 'desc'},
        });

        return historial;
    }
}
