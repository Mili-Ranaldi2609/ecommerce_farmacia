import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { PaginationDto } from '../common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CategoriaService } from './categoria.service';

@Controller('categories')
@ApiTags('Categorias')
export class CategoriaController {
  constructor(
     @Inject() private readonly categoriaService: CategoriaService,
  ) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth('bearerAuth')
  @Post()
  create(@Body() createCategoriaDto: CreateCategoriaDto) {
    return this.categoriaService.create(createCategoriaDto);    
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('bearerAuth')
  @Get()
  findAll() {
    return this.categoriaService.findAll();
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('bearerAuth')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriaService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('bearerAuth')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoriaDto: UpdateCategoriaDto) {
      return this.categoriaService.update(id, updateCategoriaDto);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('bearerAuth')
  @Delete(':id')
  async deleteProduct(@Param('id', ParseIntPipe) id: number){
    return this.categoriaService.remove(id);
  } 

  @UseGuards(AuthGuard)
  @ApiBearerAuth('bearerAuth')
  @Patch('/available/:id')
  async makeAvailableProduct(
    @Param('id', ParseIntPipe) id: number
  ){
    return this.categoriaService.updateAvailable(id);
  }
}
