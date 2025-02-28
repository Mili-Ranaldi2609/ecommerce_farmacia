import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateFavoritoDto } from './dto/create-favorito.dto';
import { DeleteFavoritoDto } from './dto/delete-favorito.dto';
import { PaginationDto } from '../common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FavoritosService } from './favoritos.service';

@Controller('favorito')
@ApiTags('Favoritos')
export class FavoritoController {
  constructor(@Inject() private readonly favoritoService: FavoritosService ) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth('bearerAuth')
  async createFavorite(@Body() createFavoritoDto: CreateFavoritoDto) {
    return this.favoritoService.create(createFavoritoDto);
  }

  //obtener fav por user
  @UseGuards(AuthGuard)
  @Get('/:id')
  @ApiBearerAuth('bearerAuth')
  async findAllFavoritesByUser(
    @Param('id') id: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.favoritoService.findAllByUserId({userId: id, page: paginationDto.page, limit: paginationDto.limit});
  }

  @UseGuards(AuthGuard)
  @Delete(':productId')
  @ApiBearerAuth('bearerAuth')
  async DeleteFavorite(
    @Param('productId') productId: number,
    @Body() deleteFavoritoDto: DeleteFavoritoDto,
  ) {
    return this.favoritoService.remove({userId: deleteFavoritoDto.userId, productId: productId})
  }
}
