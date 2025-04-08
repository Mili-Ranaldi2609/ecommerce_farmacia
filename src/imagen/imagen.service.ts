import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { CreateImagenDto } from './dto/create-imagen.dto';
import { UpdateImagenDto } from './dto/update-imagen.dto';
import { PrismaClient } from '@prisma/client';
import { ProductsService } from '../products/products.service';
import { RemoveImagenDto } from './dto/remove-imagen.dto';
import { FindImagenDto } from './dto/find-imagen.dto';
import 'multer';
import { put } from '@vercel/blob';

@Injectable()
export class ImagenService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('favoritoService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }
  constructor(
    //private readonly favoritoService: FavoritosService,
    private readonly productsService: ProductsService,
  ) {
    super();
  }

  async create(createImagenDto: CreateImagenDto) {
    try {
      //no me acuerdo porque puse el user id
      //await this.favoritoService.validateUser(createImagenDto.userId);
      await this.productsService.exists(createImagenDto.productoId);
      const imagen = await this.imagen.create({
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

  async findAllImgByProduct(findImagenDto: FindImagenDto) {
    try {
      if (findImagenDto.productoId === undefined) {
        throw new BadRequestException('Producto ID is required');
      }
      await this.productsService.exists(findImagenDto.productoId);
      const imagenes = await this.imagen.findMany({
        where: { productoId: findImagenDto.productoId, available: true },
      });
      return imagenes;
    } catch (error) {
      throw error;
    }
  }

  async findOne(findImagenDto: FindImagenDto) {
    try {
      if (findImagenDto.productoId === undefined) {
        throw new BadRequestException('Producto ID is required');
      }
      await this.productsService.exists(findImagenDto.productoId);
      const imagen = await this.imagen.findUnique({
        where: { id: findImagenDto.idImg, available: true },
      });
      return imagen;
    } catch (error) {
      throw error;
    }
  }

  update(id: number, updateImagenDto: UpdateImagenDto) {
    return `This action updates a #${id} imagen`;
  }

  async remove(removeImagenDto: RemoveImagenDto) {
    try {
      const imagen = await this.findOne({ idImg: removeImagenDto.idImagen });
      if (!imagen) {
        throw new BadRequestException('La imagen no existe');
      }

      await this.productsService.exists(removeImagenDto.productId);

      const imagenEliminada = await this.imagen.update({
        where: { id: removeImagenDto.idImagen },
        data: { available: false },
      });

      return imagenEliminada;
    } catch (error) {
      throw error;
    }
  }

  async uploadImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validar el tipo de archivo
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed');
    }

    // Validar el tamaño del archivo
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxFileSize) {
      throw new BadRequestException('File size exceeds the maximum allowed size of 5MB');
    }

    try {
      const blob = await put(file.originalname, file.buffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      return blob.url;
    } catch (error) {
      throw new BadRequestException('Failed to upload image');
    }
  }
}
