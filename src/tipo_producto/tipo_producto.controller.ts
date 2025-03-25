import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CreateTipoProductoDto } from './dto';
import { UpdateTipoProductoDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
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
  @ApiBody({
    description: 'Create a new tipo-producto',
    type: CreateTipoProductoDto,
    examples: {
      example1: {
        summary: 'Example request',
        value: {
          nombreTipo: 'Electronics',
          descripcion: 'Category for electronic products',
          categoriaId: 1,
        },
      },
    },
  })
  create(@Body() createTipoProductoDto: CreateTipoProductoDto) {
    return this.tipoProductoService.create(createTipoProductoDto);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiBearerAuth('bearerAuth')
  @ApiBody({
    description: 'Update a tipo-producto',
    type: UpdateTipoProductoDto,
    examples: {
      example1: {
        summary: 'Example request',
        value: {
          nombre: 'Updated Electronics',
          descripcion: 'Updated category for electronic products',
        },
      },
    },
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTipoProductoDto: UpdateTipoProductoDto,
  ) {
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
  async makeAvailableTipoProducto(@Param('id', ParseIntPipe) id: number) {
    return this.tipoProductoService.updateToAvailable(id);
  }
}
