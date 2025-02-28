import { Controller, Get, Post, Body, Param, Inject, Query, Patch, ParseIntPipe, Delete, UseGuards } from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { PedidoPaginationDto } from './dto/pedido-pagination.dto';
import { estadoDto } from './dto/change-estado-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PedidoService } from './pedido.service';

@Controller('pedido')
@ApiTags('Pedidos')
export class PedidoController {
  constructor(@Inject() private readonly pedidoService: PedidoService ) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth('bearerAuth')
  create(@Body() createPedidoDto: CreatePedidoDto) {
    return this.pedidoService.create(createPedidoDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  @ApiBearerAuth('bearerAuth')
  findAll(@Query() pedidoPaginationDto: PedidoPaginationDto) {
    return this.pedidoService.findAll(pedidoPaginationDto);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiBearerAuth('bearerAuth')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pedidoService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiBearerAuth('bearerAuth')
  async changeEstado(@Param('id', ParseIntPipe) id: number, @Body() estadoDto: estadoDto) {
    estadoDto.id = id;
    return this.pedidoService.changeEstado(estadoDto);
  }

  @UseGuards(AuthGuard)
  @Patch('update/:id')
  @ApiBearerAuth('bearerAuth')
  updatePedido(@Param('id', ParseIntPipe) id: number, @Body() updatePedidoDto: UpdatePedidoDto) {
    return this.pedidoService.update(id, updatePedidoDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiBearerAuth('bearerAuth')
  deletePedido(@Param('id', ParseIntPipe) id: number) {
    return this.pedidoService.remove(id);
  }

  @UseGuards(AuthGuard)
  @Get('estados/:id')
  @ApiBearerAuth('bearerAuth')
  getEstados(@Param('id', ParseIntPipe) id: number) {
    return this.pedidoService.getAllEstados(id);
  }
}
