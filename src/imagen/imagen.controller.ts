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
} from '@nestjs/common';
import { CreateImagenDto } from './dto/create-imagen.dto';
import { UpdateImagenDto } from './dto/update-imagen.dto';
import { RemoveImagenDto } from './dto/remove-imagen.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { ImagenService } from './imagen.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@Controller('imagen')
@ApiTags('imagenes')
export class ImagenController {
  constructor(@Inject() private readonly imagenService: ImagenService) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth('bearerAuth')
  @ApiBody({
    description: 'Create a new image',
    type: CreateImagenDto,
    examples: {
      example1: {
        summary: 'Example request',
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
  @Get('/:id')
  @ApiBearerAuth('bearerAuth')
  async findAllByProduct(@Param('id') id: number) {
    return this.imagenService.findAllImgByProduct({ idImg: id });
  }

  @UseGuards(AuthGuard)
  @Delete(':idImagen')
  @ApiBearerAuth('bearerAuth')
  @ApiBody({
    description: 'Remove an image',
    type: RemoveImagenDto,
    examples: {
      example1: {
        summary: 'Example request',
        value: {
          idImagen: 1,
        },
      },
    },
  })
  async removeImage(
    @Param('idImagen') idImagen: number,
    @Body() removeImagenDto: RemoveImagenDto,
  ) {
    return this.imagenService.remove(removeImagenDto);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiBearerAuth('bearerAuth')
  findOne(@Param('id') id: string) {
    return 0;
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiBearerAuth('bearerAuth')
  @ApiBody({
    description: 'Update an image',
    type: UpdateImagenDto,
    examples: {
      example1: {
        summary: 'Example request',
        value: {
          tipoImagen: 'Updated Thumbnail',
          descripcion: 'This is an updated thumbnail image.',
          urlImagen: 'https://example.com/updated-image.jpg',
        },
      },
    },
  })
  update(@Param('id') id: string, @Body() updateImagenDto: UpdateImagenDto) {
    return 0;
  }

  @UseGuards(AuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth('bearerAuth')
  async uploadImage(@UploadedFile() file: Express.Multer.File): Promise<{ url: string }> {
    const url = await this.imagenService.uploadImage(file);
    return { url };
  }
}
