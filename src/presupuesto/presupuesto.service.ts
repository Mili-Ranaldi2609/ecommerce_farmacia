import { BadRequestException, HttpException, HttpStatus, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreatePresupuestoDto } from './dto/create-presupuesto.dto';
import { UpdatePresupuestoDto } from './dto/update-presupuesto.dto';
import { EstadoPresupuestoDto } from './dto/estado-presupuesto.dto';
import { ProveedoresService } from '.././proveedores/proveedores.service';
import { ProductsService } from '.././products/products.service';
import { SolicitudPresupuestoService } from '.././solicitud-presupuesto/solicitud-presupuesto.service';
import { PaginationDto } from '../common';
import { prisma } from '../prisma/prisma-client';

@Injectable()
export class PresupuestoService {

  private readonly logger = new Logger('SolicitudPresupuestoService')

  constructor(
    private readonly proveedoresService: ProveedoresService,
    private readonly productoService: ProductsService,
    private readonly solicitudService: SolicitudPresupuestoService
  ) { }

  async create(createPresupuestoDto: CreatePresupuestoDto) {
    try {
      const { descripcion, monto, cantidad,
        proveedorId, productoId, solicitudPresupuestoId } = createPresupuestoDto

      if (!proveedorId) {
        throw new BadRequestException('El proveedorId es obligatorio.');
      }
      const proveedorExiste = await prisma.proveedores.findUnique({
        where: { id: proveedorId },
      });
      if (!proveedorExiste) {
        throw new BadRequestException(
          `El proveedor con ID ${proveedorId} no existe.`,
        );
      }
      if (!productoId) {
        throw new BadRequestException('El productoId es obligatorio.');
      }
      const productoExiste = await prisma.product.findUnique({
        where: { id: productoId },
      });
      if (!productoExiste) {
        throw new BadRequestException(
          `El producto con ID ${productoId} no existe.`,
        );
      }
      if (!solicitudPresupuestoId) {
        throw new BadRequestException(
          'El solicitudPresupuestoId es obligatorio.',
        );
      }
      const solicitudExiste = await prisma.solicitudPresupuesto.findUnique({
        where: { id: solicitudPresupuestoId },
      });
      if (!solicitudExiste) {
        throw new BadRequestException(
          `La solicitud de presupuesto con ID ${solicitudPresupuestoId} no existe.`,
        );
      }
      const createPresupuesto = await prisma.presupuesto.create({
        data: {
          descripcion,
          monto,
          cantidad,
          producto: {
            connect: { id: productoId },
          },
          proveedor: {
            connect: { id: proveedorId },
          },
          solicitudPresupuesto: {
            connect: { id: solicitudPresupuestoId },
          },
        },
      });

      const estadoPresupuesto = await prisma.historialEstadoPresupuesto.create({
        data: {
          estado: 'CREADO',
          available: true,
          presupuesto: {
            connect: { id: createPresupuesto.id }
          }
        }
      })
      return createPresupuesto;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error al crear presupuesto:', error);
      throw new BadRequestException('Error interno al crear el presupuesto.');
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const totalPages = await prisma.product.count({ where: { available: true } });
    const lastPage = Math.ceil(totalPages / limit);
    let presupuesto
    try {
      presupuesto = await prisma.presupuesto.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { available: true },
        select: {
          id: true,
          estado: true,
          descripcion: true,
          cantidad: true,
          monto: true,
          proveedorId: true,
          productoId: true,
          descargaPresupuestoId: true,
          solicitudPresupuestoId: true
        }
      })
    } catch (error) {
      throw error
    }
    return {
      data: presupuesto,
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage,
      }
    }
  }

  async findOne(id: number) {
    const presupuesto = await prisma.presupuesto.findUnique({
      where: { id: id },
      select: {
        id: true,
        estado: true,
        descripcion: true,
        cantidad: true,
        monto: true,
        proveedorId: true,
        productoId: true,
        descargaPresupuestoId: true,
        solicitudPresupuestoId: true
      }
    })
    if (!presupuesto) {
      throw new NotFoundException('Presupuesto you want was not found');
    }
    return presupuesto
  }

  async exists(id: number) {
    const presupuesto = prisma.presupuesto.findFirst({
      where: { id }
    })
    if (!presupuesto) {
      throw new NotFoundException('Presupuesto you want was not found');
    }
    return presupuesto
  }

  async update(id: number, updatePresupuestoDto: UpdatePresupuestoDto) {
    try {
      const { descripcion, cantidad, monto,
        proveedorId, productoId,
        descargaPresupuestoId, solicitudId } = updatePresupuestoDto

      const presupuestoToUpdate = await this.findOne(id)
      if (!presupuestoToUpdate) {
        throw new Error(`Presupuesto con id ${id} no encontrada`)
      }

      const updated = await prisma.presupuesto.update({
        where: { id: id },
        data: {
          descripcion, monto, cantidad,
          ...(productoId && {
            producto: {
              connect: { id: productoId }
            }
          }),
          ...(descargaPresupuestoId &&
          {
            descargaPresupuesto: {
              connect: { id: descargaPresupuestoId }
            }
          }),
          ...(solicitudId &&
          {
            solicitudPresupuesto: {
              connect: { id: solicitudId }
            }
          }
          )
        }
      })
      return updated
    } catch (error) {
      throw error
    }
  }

  async remove(id: number) {
    try {

      const presupuesto = await prisma.presupuesto.findUnique({
        where: { id },
        include: { historialPresupuesto: true }, // Asegurarse de incluir la relación con el historial
      });

      if (!presupuesto) {
        throw new Error(`Presupuesto con id ${id} no encontrada`);
      }
      if (!presupuesto.available) {
        throw new Error(`Presupuesto con id ${id} ya esta removido`);
      }

      const removed = await prisma.presupuesto.update({
        where: { id },
        data: {
          available: false,
        }
      })
      return { msg: 'Presupuesto removido con exito' }
    } catch (error) {
      throw error
    }

  }

  async enable(id: number) {
    try {

      const presupuesto = await prisma.presupuesto.findUnique({
        where: { id },
        include: { historialPresupuesto: true }, // Asegurarse de incluir la relación con el historial
      });

      if (!presupuesto) {
        throw new Error(`Presupuesto con id ${id} no encontrada`);
      }
      if (presupuesto.available) {
        throw new Error(`Presupuesto con id ${id} ya esta habilitado`);
      }

      const removed = await prisma.presupuesto.update({
        where: { id },
        data: {
          available: true,
        }
      })
      return { msg: 'Presupuesto habilitado con exito' }
    } catch (error) {
      throw error
    }
  }

  async cambiarEstadoPresupuesto(id: number, estadoDto: EstadoPresupuestoDto) {

    try {
      const { estado } = estadoDto

      const presupuesto = await prisma.presupuesto.findUnique({
        where: { id },
        include: { historialPresupuesto: true }
      })
      if (!presupuesto) {
        throw new Error(`Presupuesto con id ${id} no encontrado`);
      }
      if (presupuesto.estado === estado) {
        return {
          msg: "El estado del presupuesto ya es el mismo que el nuevo estado"
        }
      }

      const historialActual = presupuesto.historialPresupuesto.length > 0
        ? presupuesto.historialPresupuesto.reduce((ultimo, actual) =>
          new Date(ultimo.fechaModificacion) > new Date(actual.fechaModificacion)
            ? ultimo
            : actual
        ) : null;

      if (!historialActual) {
        ('No hay historial actual');
      }

      if (historialActual) {
        const historialActualizado = await prisma.historialEstadoPresupuesto.update({
          where: { id: historialActual.id },
          data: {
            available: false,
            fechaModificacion: new Date(),
          }
        })
      }

      const nuevoHistorial = await prisma.historialEstadoPresupuesto.create({
        data: {
          estado: estado,
          fechaModificacion: new Date(),
          available: true,
          presupuesto: {
            connect: { id }
          },
        }
      })

      if (nuevoHistorial) {
        const presupuestoActualizadoEstado = await prisma.presupuesto.update({
          where: { id },
          data: { estado: estado }
        })
      }


      return { message: 'Estado del presupuesto e historial actualizados correctamente' };

    } catch (error) {
      throw new Error('Error al cambiar el estado de presupuesto.');
    }
  }

  async getAllEstados(id: number) {
    const historial = await prisma.historialEstadoPresupuesto.findMany({
      where: { presupuestoId: id },
      orderBy: { fechaModificacion: 'desc' }
    })
    return historial
  }

  //buscar los presupuestos de un proveedor, id es isProveedor
  async findMyPresupuesto(id: number) {
    //existe proveedor
    const proveedor = await this.proveedoresService.findOne(id)
    if (!proveedor) {
      throw new Error('Presupuesto de proveedor no encontrado, verifique el proveedor e intente nuevamente')
    }
    const presupuesto = await prisma.presupuesto.findUnique({
      where: { proveedorId: id },
      select: {
        id: true,
        estado: true,
        descripcion: true,
        cantidad: true,
        monto: true,
        proveedorId: true,
        productoId: true,
        descargaPresupuestoId: true,
        solicitudPresupuestoId: true
      }
    })
    if (!presupuesto) {
      throw new HttpException('Presupuesto with proveedorId ${id} was not found!!', HttpStatus.BAD_REQUEST);
    }
    return presupuesto
  }

  //buscar los presupuestos de un solicitud, id es solicitudId
  async findPresupuestosBySolicitud(id: number) {
    //existe solicitud
    const solicitud = await this.solicitudService.findOne(id)
    if (!solicitud) {
      throw new Error('Presupuesto de solicitud no encontrado, verifique la solicitud e intente nuevamente')
    }
    const presupuesto = await prisma.presupuesto.findUnique({
      where: { solicitudPresupuestoId: id },
      select: {
        id: true,
        estado: true,
        descripcion: true,
        cantidad: true,
        monto: true,
        proveedorId: true,
        productoId: true,
        descargaPresupuestoId: true,
        solicitudPresupuestoId: true
      }
    })
    if (!presupuesto) {
      throw new HttpException('Presupuesto with solicitudPresupuestoId ${id} was not found!!', HttpStatus.BAD_REQUEST);
    }
    return presupuesto
  }

  async findPresupuestosByProducto(id: number) {

    //existe producto
    const producto = await this.productoService.findOne(id)
    if (!producto) {
      throw new Error('Presupuesto de producto no encontrado, verifique el producto e intente nuevamente')
    }

    const presupuesto = await prisma.presupuesto.findUnique({
      where: { productoId: id },
      select: {
        id: true,
        estado: true,
        descripcion: true,
        cantidad: true,
        monto: true,
        proveedorId: true,
        productoId: true,
        descargaPresupuestoId: true,
        solicitudPresupuestoId: true
      }
    })
    if (!presupuesto) {
      throw new HttpException('Presupuesto with productoId ${id} was not found!!', HttpStatus.BAD_REQUEST);
    }
    return presupuesto
  }

}
