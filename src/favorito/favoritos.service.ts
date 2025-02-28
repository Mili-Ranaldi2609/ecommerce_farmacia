import { HttpException, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateFavoritoDto } from './dto/create-favorito.dto';
import { ProductsService } from '../products/products.service';
import { PrismaClient } from '@prisma/client';
import { catchError, lastValueFrom, map } from 'rxjs';
import { DeleteFavoritoDto } from './dto/delete-favorito.dto';
import { FindFavoritoDto } from './dto/find-favorito.dto';

@Injectable()
export class FavoritosService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('favoritoService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Databse connected');
  }
  constructor(
    @Inject() private readonly productosService: ProductsService, // Inyección de dependencia
  ) {
    super();
  }

  async create(createFavoritoDto: CreateFavoritoDto) {
    try {
      this.productosService.exists(createFavoritoDto.productId);
      await this.productosService.exists(createFavoritoDto.productId);
      await this.productosService.exists(createFavoritoDto.userId);
      const favorito = await this.favorito.upsert({
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
      // const favorito = await this.favorito.create({
      //   data: {
      //     userId: createFavoritoDto.userId,
      //     productId: createFavoritoDto.productId,
      //   },
      // });
      return favorito;
    } catch (error) {
      this.logger.error('Error en create:', error);
      throw error;
    }
  }

  async findAllByUserId({ userId, page, limit }: FindFavoritoDto) {
    limit = limit ?? 10; // Provide a default value for limit
    try {
      await this.validateUser(userId);

      const totalFavoritos = await this.favorito.count({
        where: { userId, available: true },
      });

      const totalPages = Math.ceil(totalFavoritos / limit);
      page = page ?? 1; // Provide a default value for page

      const favoritos = await this.favorito.findMany({
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
      this.logger.log('favoritos encontrados', favoritos);
      return {
        data: favoritos,
        meta: {
          total: totalFavoritos,
          page,
          totalPages,
        },
      };
    } catch (error) {
      this.logger.error('Error en findAllByUserId', error);
      throw error;
    }
  }

  async remove(deleteFavorite: DeleteFavoritoDto) {
    try {
      await this.validateUser(deleteFavorite.userId);
      await this.productosService.exists(deleteFavorite.productId);
      const removedFavorite = this.favorito.update({
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
      this.logger.error('Error en findAllByUserId:', error);
      throw error;
    }
  }

  async validateUser(userId: number) {
    try {
      const user = await this.user.findUnique({
        where: { id: userId },
      });

      if(!user) {
        throw new HttpException('Usuario no encontrado', 404);
      }

      return user;
    } catch (error) {
      this.logger.error('Error validando usuario', error);
      throw error;
    }
  }
}
