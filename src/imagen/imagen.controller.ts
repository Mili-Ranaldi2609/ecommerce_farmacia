import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Inject,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateImagenDto } from './dto/create-imagen.dto';
import { UpdateImagenDto } from './dto/update-imagen.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { ImagenService } from './imagen.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';


@Controller('imagen')
@ApiTags('imagenes')
export class ImagenController {
  constructor(@Inject() private readonly imagenService: ImagenService) { }

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth('bearerAuth')
  @ApiBody({
    description: 'Crear una nueva imagen',
    type: CreateImagenDto,
    examples: {
      example1: {
        summary: 'Ejemplo de petición',
        value: {
          tipoImagen: 'Thumbnail',
          descripcion: 'This is a thumbnail image.',
          urlImagen: 'https://example.com/image.jpg',
          productoId: 1,
        },
      },
    },
  })
  async createImagen(@Body() createImagenDto: CreateImagenDto) {
    return this.imagenService.create(createImagenDto);
  }

  @UseGuards(AuthGuard)
  @Get('product/:productId')
  @ApiBearerAuth('bearerAuth')
  async findAllByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.imagenService.findAllImgByProduct({ productoId: productId });
  }

  @UseGuards(AuthGuard)
  @Delete(':idImagen')
  @ApiBearerAuth('bearerAuth')
  async removeImage(
    @Param('idImagen', ParseIntPipe) idImagen: number,  
    @Body('productId', ParseIntPipe) productId: number 
  ) {
    return this.imagenService.remove({ idImagen: idImagen ,productId:productId});
  }


  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiBearerAuth('bearerAuth')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.imagenService.findOne({ idImg: id });
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiBearerAuth('bearerAuth')
  @ApiBody({
    description: 'Actualizar una imagen',
    type: UpdateImagenDto,
    examples: {
      example1: {
        summary: 'Ejemplo de petición',
        value: {
          tipoImagen: 'Updated Thumbnail',
          descripcion: 'This is an updated thumbnail image.',
          urlImagen: 'https://example.com/updated-image.jpg',
        },
      },
    },
  })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateImagenDto: UpdateImagenDto) {
    return this.imagenService.update(id, updateImagenDto);
  }

  @UseGuards(AuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth('bearerAuth')
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const url = await this.imagenService.uploadImage(file);
    return { url };
  }
}