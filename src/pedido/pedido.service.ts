import { HttpException, HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { CreatePedidoDto, PedidoPaginationDto, UpdatePedidoDto, estadoDto } from './dto';
import { prisma } from '../prisma/prisma-client';


@Injectable()
export class PedidoService {

  private readonly logger = new Logger('PedidoService');

  constructor(@Inject() private readonly productService: ProductsService) {}

  async create(createPedidoDto: CreatePedidoDto) {
    try {
      const id = parseInt(createPedidoDto.usuarioId.toString());
      //1. Confirmar el id del Usuario
      const usuario = await prisma.user.findUnique({where: {id}});

      if(!usuario) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      //2. Confirmar los id de los productos
      const ids = createPedidoDto.detalles.map((item) => item.productoId);
      const productos: any[] = await this.productService.validateProducts(ids);

      //3. Proximamente calcular valores del pedido
      const totalAmount = createPedidoDto.detalles.reduce((acc, detallePedido) => {

        const price = productos.find(
          (producto) => producto.id === detallePedido.productoId,
        ).precio;
        return acc + (price * detallePedido.cantidad);
      }, 0);

      const totalItems = createPedidoDto.detalles.reduce((acc, detallePedido) => {
        return acc + detallePedido.cantidad;
      }, 0);


      //4. Crear una transaccion en la base de datos
      const pedido = await prisma.pedido.create({
        data: {
          totalAmount: totalAmount,
          totalItems: totalItems,
          usuarioId: id,
          detallesPedidos: {
            createMany: {
              data: createPedidoDto.detalles.map((detallePedido) => ({
                precio: productos.find( producto => producto.id === detallePedido.productoId).precio,
                productoId: detallePedido.productoId,
                cantidad: detallePedido.cantidad,
              }))
            },
          },
        },
        include: {
          detallesPedidos: {
            select: {
              cantidad: true,
              precio: true,
              productoId: true,
            }
          }
        }
      });

      const historial = await prisma.historialEstados.create({
        data: {
          estado: pedido.estado,
          pedidoId: pedido.id,
        }
      });


      return {...pedido,
        usuarioId: usuario,
        detallesPedidos: pedido.detallesPedidos.map((detalles) => ({
          ...detalles,
          nombre: productos.find((producto) => producto.id === detalles.productoId).nombre
        }))
      };

    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(pedidoPaginationDto: PedidoPaginationDto) {
    const totalPages = await prisma.pedido.count({
      where: {
        estado: pedidoPaginationDto.estado
      }
    });

    const currentPage = pedidoPaginationDto.page ?? 1;
    const perPage = pedidoPaginationDto.limit ?? 10; // default value of 10

    return {
      data: await prisma.pedido.findMany({
        skip: (currentPage - 1) * perPage,
        take: perPage,
        where: {
          estado: pedidoPaginationDto.estado,
          available: true
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
    
    const pedido = await prisma.pedido.findUnique({
      where: {id: id, available: true},
      include: {detallesPedidos: {
        select: {
          precio: true,
          cantidad: true,
          productoId: true,
        }
      }}
    });

    if(!pedido) {
      throw new HttpException('Pedido not found', HttpStatus.NOT_FOUND);
    }

    const ids = pedido.detallesPedidos.map((detail) => detail.productoId);
    const productos: any[] = await this.productService.validateProducts(ids);

    if(!pedido) {
      throw new HttpException('Pedido not found', HttpStatus.NOT_FOUND);
    }

    return {...pedido,
      detallesPedidos: pedido.detallesPedidos.map((detallePedidos) => ({
        ...detallePedidos,
        nombre: productos.find((producto) => producto.id === detallePedidos.productoId).nombre
      }))
    };
  }

  async update(id: number, updatePedidoDto: UpdatePedidoDto) {

    const {id: __, ...data} = updatePedidoDto;

    await this.findOne(id);

    const pedido = prisma.pedido.update({where: {id}, data: data});

    if(updatePedidoDto.estado != null) {
      const historial = await prisma.historialEstados.create({
        data: {
          estado: updatePedidoDto.estado,
          pedidoId: id,
        }
      });
    }

    return pedido;
  }

  async remove(id: number) {
    await this.findOne(id);

    const pedido = await prisma.pedido.update({
      where: {id},
      data: { available: false },
    });

    return pedido;
  }

  async changeEstado(changeEstadoPedido: estadoDto) {

    const {id, estado} = changeEstadoPedido;

    const pedido = await this.findOne(id);

    if(pedido.estado === estado) {
      return pedido;
    }

    const historial = await prisma.historialEstados.create({
      data: {
        estado: estado,
        pedidoId: id,
      }
    });

    return prisma.pedido.update({
      where: {id},
      data: {
        estado: estado
      }
    })
  }

  async getAllEstados(id: number) {
    const historial = await prisma.historialEstados.findMany({
      where: {pedidoId: id},
      orderBy: {fechaModificacion: 'desc'},
    });
    return historial;
  }
}
