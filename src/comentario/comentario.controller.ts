import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
  Inject,
} from '@nestjs/common';

import { CreateComentarioDto } from './dto/create-comentario.dto';
import { PaginationDto } from '../common';
import { FindByRating } from './dto/find-rating.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ComentarioService } from './comentario.service';

@Controller('comentario')
@ApiTags('Comentarios')
export class ComentarioController {
  constructor(@Inject() private readonly comentarioService: ComentarioService) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth('bearerAuth')
  create(@Body() createComentarioDto: CreateComentarioDto) {
    return this.comentarioService.create(createComentarioDto);
  }

  @UseGuards(AuthGuard)
  @Get('/:id')
  @ApiBearerAuth('bearerAuth')
  findAllComentsUserByID(
    @Param('id') id: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.comentarioService.findAllByUser({userId: id, page: paginationDto.page, limit: paginationDto.limit});
  }

  @UseGuards(AuthGuard)
  @Get('product/:id')
  @ApiBearerAuth('bearerAuth')
  findAllComentsByproduct(
    @Param('id') id: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.comentarioService.findAllComentProduct({productId: id, page: paginationDto.page, limit: paginationDto.limit});
  }

  //Y este metodo?
  @UseGuards(AuthGuard)
  @Get('Rating/:rating')
  @ApiBearerAuth('bearerAuth')
  async findAllRatingByproduct(
    @Param('rating', ParseIntPipe) rating: number,
    @Body() findRatingDto: FindByRating,
    @Query() paginationDto: PaginationDto,
  ) {
    findRatingDto.limit = paginationDto.limit;
    findRatingDto.page = paginationDto.page;
    findRatingDto.rating = findRatingDto.rating;
    return this.comentarioService.FindByRatingComentario(findRatingDto);
  }

  @UseGuards(AuthGuard)
  @Delete('/:id')
  @ApiBearerAuth('bearerAuth')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.comentarioService.remove({id: id});
  }

  /*
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.comentarioService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateComentarioDto: UpdateComentarioDto,
  ) {
    return this.comentarioService.update(+id, updateComentarioDto);
  }

  
    */
}
