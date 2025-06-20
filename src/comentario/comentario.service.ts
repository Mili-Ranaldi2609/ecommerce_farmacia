import { HttpException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { ProductsService } from '../products/products.service';
import { DeleteComentDto } from './dto/deleteComentario.dto';
import { FindUserDto } from './dto/find-user.dto';
import { FindProductDto } from './dto/find-product.dto';
import { FindByRating } from './dto/find-rating.dto';
import { FavoritosService } from '../favorito/favoritos.service';
import { prisma } from '../prisma/prisma-client';

@Injectable()
export class ComentarioService {
  private readonly logger = new Logger('ComentarioService');

  constructor(
    private readonly favoritoService: FavoritosService,
    private readonly productosService: ProductsService,
  ) {}
  
  async create(createComentarioDto: CreateComentarioDto) {
    try {
      await this.productosService.exists(createComentarioDto.productId);
      await this.favoritoService.validateUser(createComentarioDto.userId);
      const comentario = prisma.comentario.upsert({
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
      return comentario;
    } catch (error) {
      throw error;
    }
  }

  async findAllByUser({ userId, page, limit }: FindUserDto) {
    try {

      await this.favoritoService.validateUser(userId);
      const totalComentarios = await prisma.comentario.count({
        where: { userId: userId, available: true },
      });

      const totalPages = Math.ceil(totalComentarios / (limit || 10));

      const comentarios = await prisma.comentario.findMany({
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

      return {
        data: comentarios,
        meta: {
          total: totalComentarios,
          pages: totalPages,
        },
      };
    } catch (error) {
      throw error;
    }
  }
  //todos los comentarios de un producto
  async findAllComentProduct({ productId, page, limit }: FindProductDto) {
    try {
      await this.productosService.exists(productId);
      //paginacion
      const totalComentarios = await prisma.comentario.count({
        where: { productId: productId, available: true },
      });

      const totalPages = Math.ceil(totalComentarios / (limit || 10));

      const comentProduct = await prisma.comentario.findMany({
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

      return {
        data: comentProduct,
        meta: {
          total: totalComentarios,
          pages: totalPages,
        },
      };
    } catch (error) {
      throw error;
    }
  }
async remove(deleteComentDto: DeleteComentDto) {
  try {
    const comentarioExistente = await prisma.comentario.findUnique({
      where: { id: deleteComentDto.id, available: true },
    });
    if (!comentarioExistente) {
      throw new HttpException('Comentario no encontrado o ya eliminado', 404);
    }

    const comentarioActualizado = await prisma.comentario.update({
      where: { id: deleteComentDto.id },
      data: { available: false }, 
    });

    return comentarioActualizado;
  } catch (error) {
    if (error instanceof HttpException) {
        throw error;
    }
    this.logger.error('Error al eliminar comentario:', error.message);
    throw new HttpException('Error interno del servidor al eliminar el comentario', 500);
  }
}
  async FindByRatingComentario(data: FindByRating) {
    try {

      //verificamos que exista el producto
      await this.productosService.exists(data.productId);

      const totalComentarios = await prisma.comentario.count({
        where: {
          productId: data.productId,
          rating: data.rating,
          available: true,
        },
      });
      const totalPages = Math.ceil(totalComentarios / (data.limit || 10));

      //consultamos
      const comentarios = await prisma.comentario.findMany({
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
      return {
        data: comentarios,
        meta: {
          total: totalComentarios,
          pages: totalPages,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
