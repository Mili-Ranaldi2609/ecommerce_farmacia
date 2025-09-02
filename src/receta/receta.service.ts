import { HttpException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';
import { ProductsService } from '../products/products.service';
import { FavoritosService } from '../favorito/favoritos.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FindAllbyUserDto } from './dto/FindAllUser-receta.dto';
import { prisma } from '../prisma/prisma-client';

@Injectable()
export class RecetaService {
  private readonly logger = new Logger('recetaService');

  constructor(
    private readonly productosService: ProductsService, // Inyección de dependencia
    private readonly favoritoService: FavoritosService,
  ) {}

  async create(createRecetaDto: CreateRecetaDto) {
    try {

      await this.productosService.exists(createRecetaDto.productoId);
      await this.favoritoService.validateUser(createRecetaDto.userId);

      const receta = await prisma.receta.create({
        data: createRecetaDto,
      });
      return receta;
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async findAll(data: PaginationDto) {
    try {
      const {page = 1, limit = 10} = data;
      const totalRecetas = await prisma.receta.count({
        where: { available: true },
      });

      const totalPages = Math.ceil(totalRecetas / limit);
      const recetas = await prisma.receta.findMany({
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
      return {
        data: recetas,
        meta: {
          total: totalRecetas,
          pages: totalPages,
        },
      };
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }
  //encontrar todas las recetas de un solo usuario
  async findAllByUser({ userId, page, limit }: FindAllbyUserDto) {
    try {
      page = page || 1;
      limit = limit || 10;
      await this.favoritoService.validateUser(userId);

      const totalRecetas = await prisma.receta.count({
        where: { available: true, userId: userId },
      });

      const totalPages = Math.ceil(totalRecetas / limit);
      const recetas = await prisma.receta.findMany({
        where: { available: true, userId: userId }, // AÑADE ESTA LÍNEA: userId: userId
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          userId: true,
          productoId: true,
          descripcion: true,
        },
      });

      return {
        data: recetas,
        meta: {
          total: totalRecetas,
          pages: totalPages,
        },
      };
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async findOne(id: number) {
    try {

      const receta = await prisma.receta.findUnique({
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

      return receta;
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }
  async remove(id: number) {
    try {

      await this.findOne(id);

      const receta = await prisma.receta.update({
        where: { id },
        data: { available: false },
      });

      return receta;
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  update(id: number, updateRecetaDto: UpdateRecetaDto) {
    const receta = prisma.receta.findFirst({
      where: { id },
    });

    if (!receta) {
      throw new HttpException('Receta Not Found', 400);
    }

    return prisma.receta.update({
      where: { id },
      data: updateRecetaDto,
    });
  }
}
