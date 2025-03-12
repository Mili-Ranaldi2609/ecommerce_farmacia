import { HttpException, HttpStatus, Inject, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateSolicitudPresupuestoDto } from './dto/create-solicitud-presupuesto.dto';
import { UpdateSolicitudPresupuestoDto } from './dto/update-solicitud-presupuesto.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { EstadoSolicitudDto } from './dto/';
import { ProductsService } from '../products/products.service';
import { lastValueFrom, catchError } from 'rxjs';

@Injectable()
export class SolicitudPresupuestoService extends PrismaClient implements OnModuleInit{
  
  private readonly logger = new Logger('SolicitudPresupuestoService')
  
  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected')
  }

   constructor(
      @Inject() private readonly productosService: ProductsService, 
    ) {
      super();
    }
  
  //TODO: agredar relacion con usuario que crea la solicitud, token o userId
  async create(createSolicitudPresupuestoDto: CreateSolicitudPresupuestoDto) {
   try {
    const { descripcion, cantidad, productoId, userId } = createSolicitudPresupuestoDto

    const createSolPrep = await this.solicitudPresupuesto.create({
      data: {
        descripcion, cantidad,  userId,
        producto:{
          connect:{id: productoId}
        }
      }
    })
    const estadoSolicitud = await this.historialEstadoSolicitud.create({
      data:{
        estado: createSolPrep.estado,
        available: true, 
        solicitud: {
          connect: { id: createSolPrep.id}
        },
      },
    })
    return createSolPrep
   } catch (error) {
    this.logger.error('Error en create:', error);
    throw error
   }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
  
    const totalPages = await this.product.count({ where: { available: true } });
    const lastPage = Math.ceil(totalPages / limit);

    try {
      const solicitudesP = await this.solicitudPresupuesto.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { available: true },
        select: {
          id: true, // Campos de SolicitudPresupuesto
          descripcion: true,
          cantidad: true,
          estado: true,
          userId: true, 
          producto: { // Relación con Producto
            select: {
              id: true,
              nombre: true,
              precio: true,
              categorias: {
                include: {
                  categoria: {
                    select: {
                      id: true,
                      nombreCategoria: true,
                    },
                  },
                },
              },
              tipoProducto: {
                select: {
                  id: true,
                  nombreTipo: true,
                  tipoPadreId: true,
                },
              },
              descripcion: {
                select: {
                  descripcion: true,
                  caracteristicas: true,
                },
              },
              tiposDeUso: {
                select: {
                  descripcion: true,
                  tiposDeUso: true,
                },
              },
            },
          },
        },
      });
  
      return solicitudesP;
    } catch (error) {
      this.logger.error('Error en find all:', error);
      throw error
    }
  }


  async findOne(id: number) {
    
      const solicitud = await this.solicitudPresupuesto.findFirst({
        where: { id: id },
        select: {
          id: true, // Campos de SolicitudPresupuesto
          descripcion: true,
          cantidad: true,
          estado: true,
          userId: true,
          producto: { // Relación con Producto
            select: {
              id: true,
              nombre: true,
              precio: true,
              categorias: {
                include: {
                  categoria: {
                    select: {
                      id: true,
                      nombreCategoria: true,
                    },
                  },
                },
              },
              tipoProducto: {
                select: {
                  id: true,
                  nombreTipo: true,
                  tipoPadreId: true,
                },
              },
              descripcion: {
                select: {
                  descripcion: true,
                  caracteristicas: true,
                },
              },
              tiposDeUso: {
                select: {
                  descripcion: true,
                  tiposDeUso: true,
                },
              },
            },
          },
        },
      });
      if(!solicitud){
        throw new HttpException('Solicitud Not Found', 404);
      }
      return solicitud
   
  }

  async exists(id: number){
    const solicitud = this.solicitudPresupuesto.findFirst({
      where:{id}
    })
    if (!solicitud) {
          throw new NotFoundException('Solicitud you want was not found');
    }
    return solicitud
  }


  async update(id: number, updateSolicitudPresupuestoDto: UpdateSolicitudPresupuestoDto) {
    try {
      const {descripcion, cantidad, productoId, userId} = updateSolicitudPresupuestoDto
      
      // Verificar si la solicitud existe
      const solicitudToUpdate = await this.findOne(id);
      if (!solicitudToUpdate) {
        throw new Error(`SolicitudPresupuesto con id ${id} no encontrada`);
      }

      // Validar que el producto exista antes de conectarlo (opcional)
      if (productoId) {
        const productoExists = await this.product.findUnique({
          where: { id: productoId },
        });
        if (!productoExists) {
          throw new Error(`Producto con id ${productoId} no encontrado`);
        }
      }

      const updated = await this.solicitudPresupuesto.update({
        where: {id: id },
        data:{
          descripcion, cantidad, userId,
          ...(productoId && { producto: { connect: { id: productoId } } }), // Conecta solo si productoId es válido
        }
      })
      return updated
    } catch (error) {
      this.logger.error('Error en create:', error);
      throw error
    }
  }

  async remove(id: number) {
    try {
      const solicitud = await this.solicitudPresupuesto.findUnique({
        where: { id },
        include: { estadoSolicitud: true }, // Asegurarse de incluir la relación con el historial
      });
  
      if (!solicitud) {
        throw new Error(`SolicitudPresupuesto con id ${id} no encontrada`);
      }

      const removed = await this.solicitudPresupuesto.update({
        where:{id},
        data:{
          available: false,
          //estado: EstadoSolicitud.CANCELADA
        }
      })
      
      // const historialActual = solicitud.estadoSolicitud.find(
      //   (historial) => historial.available
      // );

      // if (!historialActual) {
      //   throw new Error(`No se encontró un historial activo para la solicitud con id ${id}`);
      // }

      // await this.historialEstadoSolicitud.update({
      //   where: { id: historialActual.id },
      //   data: {
      //     estado: 'CANCELADA', 
      //     fechaModificacion: new Date(),
      //     available: false 
      //   },
      // });

      return {msg:'Solicitud removida con exito', removed}

    } catch (error) {
      this.logger.error('Error en create:', error);
      throw error
    }
  }

  async enable(id: number) {
    try {
      const solicitud = await this.solicitudPresupuesto.findUnique({
        where: { id },
        include: { estadoSolicitud: true }, // Asegurarse de incluir la relación con el historial
      });
  
      if (!solicitud) {
        throw new Error(`SolicitudPresupuesto con id ${id} no encontrada`);
      }

      const enabled = await this.solicitudPresupuesto.update({
        where:{id},
        data:{
          available: true,
          //estado: EstadoSolicitud.CREADA
        }
      })
      
      // Encontrar el historial con la fecha de modificación más reciente
      // const historialActualizado = solicitud.estadoSolicitud.reduce((ultimo, actual) => {
      //   return new Date(ultimo.fechaModificacion) > new Date(actual.fechaModificacion)
      //     ? ultimo
      //     : actual;
      // });

      // if (!historialActualizado) {
      //   throw new Error (`No se encontró un historial inactivo para la solicitud con id ${id}`);
      // }

      // await this.historialEstadoSolicitud.update({
      //   where: { id: historialActualizado.id },
      //   data: {
      //     estado: 'CREADA', // Cambiar el estado a CREADA
      //     fechaModificacion: new Date(),
      //     available: true 
      //   },
      // });

      return {
        msg:'Solicitud habilitada con exito, CREADA',
        enabled
      }

    } catch (error) {
      this.logger.error('Error en create:', error);
      throw error
    }
  }

  async cambiarEstadoSolicitud(estadoDto: EstadoSolicitudDto  ) {
    try {
      const {id, estado} = estadoDto
      // Paso 1: Buscar la solicitud por ID
      const solicitud = await this.solicitudPresupuesto.findUnique({
        where: { id },
        include: { estadoSolicitud: true }, // Incluir todos los historiales relacionados
      });
  
      if (!solicitud) {
        throw new Error(`SolicitudPresupuesto con id ${id} no encontrada`);
      }

      if(solicitud.estado === estado){
        return {
          msg: "El estado de la solicitud ya es el mismo que el nuevo estado"
        }
      }

      // Paso 2: Encontrar el historial más reciente
      //TODO: cambiar prisma historial, agregar fechadesdeHasta y/o activo: boolean
      const historialActual = solicitud.estadoSolicitud.length > 0
      ? solicitud.estadoSolicitud.reduce((ultimo, actual) =>
          new Date(ultimo.fechaModificacion) > new Date(actual.fechaModificacion)
            ? ultimo
            : actual
        )
      : null;

      if (!historialActual) {
      }

  
      if (historialActual) {
        // Paso 3: Finalizar el historial actual
        const historialActualizado = await this.historialEstadoSolicitud.update({
          where: { id: historialActual.id },
          data: {
            available: false,
            fechaModificacion: new Date(),
          },
        });
      }
  
      // Paso 4: Crear un nuevo historial con el nuevo estado
      const nuevoHistorial = await this.historialEstadoSolicitud.create({
        data: {
          estado: estado, // Asignar el nuevo estado
          solicitud: {
            connect: { id }, // Conectar con la solicitud de presupuesto
          },
          fechaModificacion: new Date(), // Establecer la fecha de creación
          available: true, // Marcar como activo
        },
      });
  
     // Paso 5: Actualizar el estado de la solicitud
     const solPrepUpdated = await this.solicitudPresupuesto.update({
        where: { id },
        data: {
          estado: estado, // Actualizar el estado
          updatedAt: new Date(), // Actualizar la fecha de modificación
        },
      });
  
      return { message: 'Estado de la solicitud y el historial actualizados correctamente' };
    } catch (error) {
      this.logger.error('Error en cambiarEstadoSolicitud:', error.message);
      throw new Error('Error al cambiar el estado de la solicitud de presupuesto.');
    }
  }
  
  async getAllEstados(id: number) {
    const historial = await this.historialEstadoSolicitud.findMany({
      where: {solicitudPresupuestoId: id},
      orderBy: {fechaModificacion: 'desc'},
    });
    return historial;
  }

  async validateUser(userId: number) {
    try {
      await this.user.findUnique({
        where: { id: userId },
      });
    } catch (error) {
      this.logger.error('Error validando usuario', error);
      throw error;
    }
  }

  async getSolicitudesByUser(id: number) {
    await this.validateUser(id);
    const solicitudes = await this.solicitudPresupuesto.findMany({
      where: {userId: id},
    });
    return solicitudes;
  }

  async getSolicitudesByProduct(id: number) {
    const producto = await this.productosService.findOne(id);
    
    if(!producto){
      throw new Error('Presupuesto de producto no encontrado, verifique el producto e intente nuevamente')
    }
    const solicitudes = await this.solicitudPresupuesto.findMany({
    where: {productId: id},
    });

    if(!solicitudes){
      throw new HttpException('Solicitudes Not Founds', 404);
    }
  
    return solicitudes;
  }




}
