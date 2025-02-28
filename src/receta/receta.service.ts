import { HttpException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';
import { PrismaClient } from '@prisma/client';
import { ProductsService } from '../products/products.service';
import { FavoritosService } from '../favorito/favoritos.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FindAllbyUserDto } from './dto/FindAllUser-receta.dto';

@Injectable()
export class RecetaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('recetaService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Databse connected');
  }
  constructor(
    private readonly productosService: ProductsService, // Inyección de dependencia
    private readonly favoritoService: FavoritosService,
  ) {
    super();
  }

  async create(createRecetaDto: CreateRecetaDto) {
    try {
      this.logger.log(
        'create receta service ',
        JSON.stringify(createRecetaDto),
      );

      await this.productosService.exists(createRecetaDto.productoId);
      await this.favoritoService.validateUser(createRecetaDto.userId);

      const receta = await this.receta.create({
        data: createRecetaDto,
      });
      this.logger.log('receta created', JSON.stringify(receta));
      return receta;
    } catch (error) {
      this.logger.error('Error en create receta:', error);
      throw new HttpException(error.message, 500);
    }
  }

  async findAll(data: PaginationDto) {
    this.logger.log('findAllReceta service ');
    try {
      const {page = 1, limit = 10} = data;
      const totalRecetas = await this.receta.count({
        where: { available: true },
      });

      const totalPages = Math.ceil(totalRecetas / limit);
      const recetas = await this.receta.findMany({
        where: { available: true },
        skip: (page - 1) * limit,
        take: data.limit,
        select: {
          id: true,
          userId: true,
          productoId: true,
          descripcion: true,
        },
      });
      this.logger.log('recetas encontrados', JSON.stringify(recetas));
      return {
        data: recetas,
        meta: {
          total: totalRecetas,
          pages: totalPages,
        },
      };
    } catch (error) {
      this.logger.error('Error en findAllReceta:', error);
      throw new HttpException(error.message, 500);
    }
  }
  //encontrar todas las recetas de un solo usuario
  async findAllByUser({ userId, page, limit }: FindAllbyUserDto) {
    this.logger.log('findAllRecetaByUser service ');
    try {
      page = page || 1;
      limit = limit || 10;
      await this.favoritoService.validateUser(userId);

      const totalRecetas = await this.receta.count({
        where: { available: true, userId: userId },
      });

      const totalPages = Math.ceil(totalRecetas / limit);
      const recetas = await this.receta.findMany({
        where: { available: true },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          userId: true,
          productoId: true,
          descripcion: true,
        },
      });
      this.logger.log(
        'recetas para el usuario ',
        userId,
        ' encontrados',
        JSON.stringify(recetas),
      );
      return {
        data: recetas,
        meta: {
          total: totalRecetas,
          pages: totalPages,
        },
      };
    } catch (error) {
      this.logger.error('Error en findAllReceta:', error);
      throw new HttpException(error.message, 500);
    }
  }

  async findOne(id: number) {
    try {
      this.logger.log('findOne receta service ', JSON.stringify(id));

      const receta = await this.receta.findUnique({
        where: { id, available: true },
        select: {
          userId: true,
          descripcion: true,
          producto: {
            select: {
              id: true,
              nombre: true,
              descripcion: true,
              precio: true,
            },
          },
        },
      });

      if (!receta) {
        throw new HttpException('Receta Not Found', 400);
      }

      //chequeo el user, ya que si esta dado de baja no me traiga la receta
      //receta.userId = 2;
      await this.favoritoService.validateUser(receta.userId);

      this.logger.log('receta encontrada', JSON.stringify(receta));
      return receta;
    } catch (error) {
      this.logger.error('Error en findOne receta:', error);
      throw new HttpException(error.message, 500);
    }
  }
  async remove(id: number) {
    try {
      this.logger.log('delete receta service ', JSON.stringify(id));

      await this.findOne(id);

      const receta = await this.receta.update({
        where: { id },
        data: { available: false },
      });

      this.logger.log('receta eliminada', JSON.stringify(receta));
      return receta;
    } catch (error) {
      this.logger.error('Error en delete receta:', error);
      throw new HttpException(error.message, 500);
    }
  }

  update(id: number, updateRecetaDto: UpdateRecetaDto) {
    const receta = this.receta.findFirst({
      where: { id },
    });

    if (!receta) {
      throw new HttpException('Receta Not Found', 400);
    }

    return this.receta.update({
      where: { id },
      data: updateRecetaDto,
    });
  }
}
