import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, ParseIntPipe, UseInterceptors, UseGuards } from '@nestjs/common';
import { CreateDescripcionDto } from './dto/create-descripcion.dto';
import { UpdateDescripcionDto } from './dto/update-descripcion.dto';
import { SanitizeInterceptor } from '../common/sanitize.interceptor';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DescripcionService } from './descripcion.service';

@Controller('descripcion')
@ApiTags('Descripciones')
export class DescripcionController {
  constructor(
    @Inject() private readonly descripcionService: DescripcionService,
  ) {}
  //Create y getall no se usa, create se hace con producto
  // @Post()
  // create(@Body() createDescripcionDto: CreateDescripcionDto) {
  //   return this.descripcionService.create(createDescripcionDto);
  // }

  // @Get()
  // findAll() {
  //   return this.descripcionService.findAll();
  // }

  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiBearerAuth('bearerAuth')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.descripcionService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiBearerAuth('bearerAuth')
  @UseInterceptors(SanitizeInterceptor)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDescripcionDto: UpdateDescripcionDto
  ) {
    return this.descripcionService.update(id, updateDescripcionDto);
  }

  @UseGuards(AuthGuard)
  @Patch('makeAvailable/:id')
  @ApiBearerAuth('bearerAuth')
  async makeAvailable(@Param('id', ParseIntPipe) id: number) {
    return this.descripcionService.makeAvailable(id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiBearerAuth('bearerAuth')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.descripcionService.remove(id);
  }
}
