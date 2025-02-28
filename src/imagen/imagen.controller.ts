import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  Query,
  ParseIntPipe,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { CreateImagenDto } from './dto/create-imagen.dto';
import { UpdateImagenDto } from './dto/update-imagen.dto';
import { RemoveImagenDto } from './dto/remove-imagen.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ImagenService } from './imagen.service';

@Controller('imagen')
@ApiTags('imagenes')
export class ImagenController {
  constructor(@Inject() private readonly imagenService: ImagenService ) {}
  private readonly logger = new Logger('imagenController');

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth('bearerAuth')
  async createImagen(@Body() createImagenDto: CreateImagenDto) {
    return this.imagenService.create(createImagenDto);
  }

  @UseGuards(AuthGuard)
  @Get('/:id')
  @ApiBearerAuth('bearerAuth')
  async findAllByProduct(@Param('id') id: number) {
    return this.imagenService.findAllImgByProduct({idImg: id});
  }

  @UseGuards(AuthGuard)
  @Delete(':idImagen') //la variable se tiene que llamar igual al DTO
  @ApiBearerAuth('bearerAuth')
  async removeImage(
    @Param('idImagen') idImagen: number,
    @Body() removeImagenDto: RemoveImagenDto,
  ) {
    
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
  update(@Param('id') id: string, @Body() updateImagenDto: UpdateImagenDto) {
    return 0;
  }
}
