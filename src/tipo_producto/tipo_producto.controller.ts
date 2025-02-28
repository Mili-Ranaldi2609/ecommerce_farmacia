import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CreateTipoProductoDto } from './dto';
import { UpdateTipoProductoDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TipoProductoService } from './tipo-producto.service';

@Controller('tipo-producto')
@ApiTags('Tipos-Producto')
export class TipoProductoController {
  constructor(
      @Inject() private readonly tipoProductoService: TipoProductoService,
    ) {}

  @UseGuards(AuthGuard)
  @Get()
  @ApiBearerAuth('bearerAuth')
  findAll() {
    return this.tipoProductoService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiBearerAuth('bearerAuth')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tipoProductoService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth('bearerAuth')
  create(@Body() createTipoProductoDto: CreateTipoProductoDto) {
    return this.tipoProductoService.create(createTipoProductoDto);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiBearerAuth('bearerAuth')
  async update( @Param('id', ParseIntPipe) id: number, @Body() updateTipoProductoDto: UpdateTipoProductoDto) {
    return this.tipoProductoService.update(id, updateTipoProductoDto);
  }

  @UseGuards(AuthGuard)
  @Delete('/:id')
  @ApiBearerAuth('bearerAuth')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.tipoProductoService.remove(id);
  }

  @UseGuards(AuthGuard)
  @Patch('/available/:id')
  @ApiBearerAuth('bearerAuth')
  async makeAvailableTipoProducto(
    @Param('id', ParseIntPipe) id: number,
  ){
    return this.tipoProductoService.updateToAvailable(id)
  }
}
