import { HttpException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { PrismaClient } from '@prisma/client';
import { ProductsService } from '../products/products.service';
import { DeleteComentDto } from './dto/deleteComentario.dto';
import { FindUserDto } from './dto/find-user.dto';
import { FindProductDto } from './dto/find-product.dto';
import { FindByRating } from './dto/find-rating.dto';
import { FavoritosService } from '../favorito/favoritos.service';

@Injectable()
export class ComentarioService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ComentarioService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Databse connected');
  }
  constructor(
    /**
     * no hace falta conectar el microservicio ya que se conecta con el favorito service
     * al igual que el producto service
     */
    //@Inject(NATS_SERVICE) private readonly userClient: ClientProxy, //conexion a microservice
    //private readonly productosService: ProductsService, // Inyección de dependencia
    private readonly favoritoService: FavoritosService,
    private readonly productosService: ProductsService,
  ) {
    super();
  }
  async create(createComentarioDto: CreateComentarioDto) {
    try {
      await this.productosService.exists(createComentarioDto.productId);
      await this.favoritoService.validateUser(createComentarioDto.userId);
      const comentario = this.comentario.upsert({
        where: {
          userId_productId: {
            //busca si el comentario ya existe con id y productId
            userId: createComentarioDto.userId,
            productId: createComentarioDto.productId,
          },
        },
        //si existe actualiza los siguientes campos
        update: {
          //aca tengo que ver cuales van realmente
          rating: createComentarioDto.rating,
          comentario: createComentarioDto.comentario,
          tituloComentario: createComentarioDto.tituloComentario,
        },
        //si no existe, crea un nuevo comentario
        create: {
          userId: createComentarioDto.userId,
          productId: createComentarioDto.productId,
          rating: createComentarioDto.rating,
          comentario: createComentarioDto.comentario,
          tituloComentario: createComentarioDto.tituloComentario,
        },
      });
      this.logger.log('comentario creado:', JSON.stringify(comentario));
      return comentario;
    } catch (error) {
      this.logger.error('Error en create:', error);
      throw error;
    }
  }

  async findAllByUser({ userId, page, limit }: FindUserDto) {
    try {
      this.logger.log(`User ID recibido: ${userId}`);

      await this.favoritoService.validateUser(userId);
      const totalComentarios = await this.comentario.count({
        where: { userId: userId, available: true },
      });

      const totalPages = Math.ceil(totalComentarios / (limit || 10));

      const comentarios = await this.comentario.findMany({
        where: { userId: userId, available: true },
        skip: ((page || 1) - 1) * (limit || 10),
        take: limit,
        select: {
          comentario: true,
          rating: true,
          tituloComentario: true,
          product: {
            select: {
              nombre: true,
              precio: true,
            },
          },
        },
      });

      this.logger.log('comentarios encontrados', JSON.stringify(comentarios));
      return {
        data: comentarios,
        meta: {
          total: totalComentarios,
          pages: totalPages,
        },
      };
    } catch (error) {
      this.logger.error('Error en findAllByUserId', error);
      throw error;
    }
  }
  //todos los comentarios de un producto
  async findAllComentProduct({ productId, page, limit }: FindProductDto) {
    try {
      await this.productosService.exists(productId);
      //paginacion
      const totalComentarios = await this.comentario.count({
        where: { productId: productId, available: true },
      });

      const totalPages = Math.ceil(totalComentarios / (limit || 10));

      const comentProduct = await this.comentario.findMany({
        where: { productId: productId, available: true },
        skip: ((page ?? 1) - 1) * (limit || 10),
        take: limit,
        select: {
          product: {
            select: {
              nombre: true,
              precio: true,
            },
          },
          comentario: true,
          rating: true,
          tituloComentario: true,
        },
      });

      this.logger.log(
        'comentarios de producto encontrados',
        JSON.stringify(comentProduct),
      );
      return {
        data: comentProduct,
        meta: {
          total: totalComentarios,
          pages: totalPages,
        },
      };
    } catch (error) {
      this.logger.error('Error en findAllByUserId', error);
      throw error;
    }
  }

  async remove(deleteComentDto: DeleteComentDto) {
    try {
      const comentario = await this.comentario.findUnique({
        where: { id: deleteComentDto.id, available: true },
      });
      if (!comentario) {
        throw new HttpException('comentario not found', 400);
      }

      await this.comentario.update({
        where: { id: deleteComentDto.id },
        data: { available: false },
      });
      this.logger.log('Comentario eliminado exitosamente');
      return comentario;
    } catch (error) {
      this.logger.error('Error al eliminar comentario:', error);
      throw error;
    }
  }
  async FindByRatingComentario(data: FindByRating) {
    try {
      this.logger.log('Datos recibidos service get:', JSON.stringify(data));

      //verificamos que exista el producto
      await this.productosService.exists(data.productId);

      const totalComentarios = await this.comentario.count({
        where: {
          productId: data.productId,
          rating: data.rating,
          available: true,
        },
      });
      const totalPages = Math.ceil(totalComentarios / (data.limit || 10));

      //consultamos
      const comentarios = await this.comentario.findMany({
        skip: ((data.page ?? 1) - 1) * (data.limit ?? 10),
        take: data.limit,
        where: {
          productId: data.productId,
          rating: data.rating,
          available: true,
        },
        select: {
          tituloComentario: true,
          comentario: true,
          rating: true,

          product: {
            select: {
              nombre: true,
              precio: true,
            },
          },
        },
      });
      this.logger.log('comentarios encontrados', JSON.stringify(comentarios));
      return {
        data: comentarios,
        meta: {
          total: totalComentarios,
          pages: totalPages,
        },
      };
    } catch (error) {
      this.logger.error('Error en FindByRatingComentario:', error);
      throw error;
    }
  }
}
