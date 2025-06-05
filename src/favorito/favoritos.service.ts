import { HttpException, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateFavoritoDto } from './dto/create-favorito.dto';
import { ProductsService } from '../products/products.service';
import { DeleteFavoritoDto } from './dto/delete-favorito.dto';
import { FindFavoritoDto } from './dto/find-favorito.dto';
import { prisma } from '../prisma/prisma-client';

@Injectable()
export class FavoritosService {
  private readonly logger = new Logger('favoritoService');

  constructor(
    @Inject() private readonly productosService: ProductsService, // Inyección de dependencia
  ) {}

  async create(createFavoritoDto: CreateFavoritoDto) {
    try {
      this.productosService.exists(createFavoritoDto.productId);
      await this.productosService.exists(createFavoritoDto.productId);
      await this.productosService.exists(createFavoritoDto.userId);
      const favorito = await prisma.favorito.upsert({
        //upsert actualiza si existe, o crea si no existe
        where: {
          userId_productId: {
            userId: createFavoritoDto.userId,
            productId: createFavoritoDto.productId,
          },
        },
        update: { available: true }, //actualiza si existe
        create: {
          userId: createFavoritoDto.userId,
          productId: createFavoritoDto.productId,
          available: true,
        }, // Crea si no existe
      });
      // const favorito = await prisma.favorito.create({
      //   data: {
      //     userId: createFavoritoDto.userId,
      //     productId: createFavoritoDto.productId,
      //   },
      // });
      return favorito;
    } catch (error) {
      throw error;
    }
  }

  async findAllByUserId({ userId, page, limit }: FindFavoritoDto) {
    limit = limit ?? 10; // Provide a default value for limit
    try {
      await this.validateUser(userId);

      const totalFavoritos = await prisma.favorito.count({
        where: { userId, available: true },
      });

      const totalPages = Math.ceil(totalFavoritos / limit);
      page = page ?? 1; // Provide a default value for page

      const favoritos = await prisma.favorito.findMany({
        where: { userId, available: true },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          product: {
            select: {
              id: true,
              nombre: true,
              precio: true,
              marca: true,
            },
          },
        },
      });
      return {
        data: favoritos,
        meta: {
          total: totalFavoritos,
          page,
          totalPages,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(deleteFavorite: DeleteFavoritoDto) {
    try {
      await this.validateUser(deleteFavorite.userId);
      await this.productosService.exists(deleteFavorite.productId);
      const removedFavorite = prisma.favorito.update({
        where: {
          userId_productId: {
            userId: deleteFavorite.userId,
            productId: deleteFavorite.productId,
          },
        },
        data: {
          available: false,
        },
      });
      return removedFavorite;
    } catch (error) {
      throw error;
    }
  }

  async validateUser(userId: number) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if(!user) {
        throw new HttpException('Usuario no encontrado', 404);
      }

      return user;
    } catch (error) {
      throw error;
    }
  }
}
