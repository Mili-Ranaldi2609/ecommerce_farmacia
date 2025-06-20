import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CreateImagenDto } from './dto/create-imagen.dto';
import { UpdateImagenDto } from './dto/update-imagen.dto';
import { ProductsService } from '../products/products.service';
import 'multer';
import { put } from '@vercel/blob';
import { prisma } from '../prisma/prisma-client';

@Injectable()
export class ImagenService {
  private readonly logger = new Logger('favoritoService');

  constructor(
    private readonly productsService: ProductsService,
  ) {}

  async create(createImagenDto: CreateImagenDto) {
    try {
      await this.productsService.exists(createImagenDto.productoId);
      const imagen = await prisma.imagen.create({
        data: {
          tipoImagen: createImagenDto.tipoImagen,
          descripcion: createImagenDto.descripcion,
          urlImagen: createImagenDto.urlImagen,
          productoId: createImagenDto.productoId,
        },
      });
      return imagen;
    } catch (error) {
      throw error;
    }
  }

  async findAllImgByProduct(findOptions: { productoId: number }) {
    try {
      if (findOptions.productoId === undefined) {
        throw new BadRequestException('El ID del producto es requerido');
      }
      await this.productsService.exists(findOptions.productoId);
      const imagenes = await prisma.imagen.findMany({
        where: { productoId: findOptions.productoId, available: true },
      });
      return imagenes;
    } catch (error) {
      throw error;
    }
  }

  async findOne(findOptions: { idImg: number }) {
    try {
      if (findOptions.idImg === undefined) {
        throw new BadRequestException('El ID de la imagen es requerido');
      }
      const imagen = await prisma.imagen.findUnique({
        where: { id: findOptions.idImg, available: true },
      });
      return imagen;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateImagenDto: UpdateImagenDto) {
    try {
      const existingImagen = await prisma.imagen.findUnique({ where: { id } });

      if (!existingImagen) {
        throw new BadRequestException(`No se encontró la imagen con ID ${id}`);
      }

      if (updateImagenDto.productoId) {
        await this.productsService.exists(updateImagenDto.productoId);
      }

      const updatedImagen = await prisma.imagen.update({
        where: { id },
        data: {
          tipoImagen: updateImagenDto.tipoImagen,
          descripcion: updateImagenDto.descripcion,
          urlImagen: updateImagenDto.urlImagen,
          productoId: updateImagenDto.productoId,
        },
      });
      return updatedImagen;
    } catch (error) {
      throw error;
    }
  }
 async remove(removeOptions: { idImagen: number; productId: number }) {
    try {
      const imagen = await this.findOne({ idImg: removeOptions.idImagen });
      if (!imagen) {
        throw new BadRequestException('La imagen no existe');
      }
      await this.productsService.exists(removeOptions.productId);
      if (imagen.productoId !== removeOptions.productId) {
        throw new BadRequestException('La imagen no pertenece a este producto.');
      }
      const imagenEliminada = await prisma.imagen.update({
        where: { id: removeOptions.idImagen },
        data: { available: false },
      });
      return imagenEliminada;
    } catch (error) {
      throw error;
    }
  }


  async uploadImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se subió ningún archivo');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Tipo de archivo inválido. Solo se permiten JPEG, PNG, GIF y WEBP');
    }

    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxFileSize) {
      throw new BadRequestException('El tamaño del archivo excede el tamaño máximo permitido de 5MB');
    }

    try {
      const blob = await put(file.originalname, file.buffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      return blob.url;
    } catch (error) {
      throw new BadRequestException('Fallo al subir la imagen');
    }
  }
}