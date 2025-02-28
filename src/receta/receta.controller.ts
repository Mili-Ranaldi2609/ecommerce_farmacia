import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  Logger,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';
import { PaginationDto } from '../common';
import { FindOneRecetaDto } from './dto/findOnereceta.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RecetaService } from './receta.service';

@Controller('receta')
@ApiTags('Recetas')
export class RecetaController {
  constructor(@Inject() private readonly recetaService: RecetaService ) {}

  private logger = new Logger(RecetaController.name);

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth('bearerAuth')
  create(@Body() createRecetaDto: CreateRecetaDto) {
    return this.recetaService.create(createRecetaDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  @ApiBearerAuth('bearerAuth')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.recetaService.findAll(paginationDto);
  }

  //encontrar todas las recetas de un solo usuario
  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiBearerAuth('bearerAuth')
  findAllByUser(
    @Param('id', ParseIntPipe) id: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.recetaService.findAllByUser({userId: id, page: paginationDto.page, limit: paginationDto.limit});
  }

  //encontrar una receta
  @UseGuards(AuthGuard)
  @Get('receta/:idReceta')
  @ApiBearerAuth('bearerAuth')
  findOne(@Param('idReceta', ParseIntPipe) idReceta: number) {
    return this.recetaService.findOne(idReceta);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiBearerAuth('bearerAuth')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.recetaService.remove(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiBearerAuth('bearerAuth')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateRecetaDto: UpdateRecetaDto) {
    return this.recetaService.update(id, updateRecetaDto);
  }
}
