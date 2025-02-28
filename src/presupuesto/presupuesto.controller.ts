import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Query, ParseIntPipe, BadRequestException, UseGuards } from '@nestjs/common';
import { CreatePresupuestoDto } from './dto/create-presupuesto.dto';
import { UpdatePresupuestoDto } from './dto/update-presupuesto.dto';
import { PaginationDto } from '../common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PresupuestoService } from './presupuesto.service';
import { EstadoPresupuestoDto } from './dto/estado-presupuesto.dto';
import { EstadoPresupuesto } from '@prisma/client';
import { estadoPresupuestoList } from './enum/estado-presupuesto';

@Controller('presupuesto')
@ApiTags('Presupuestos')
export class PresupuestoController {
  constructor(
    @Inject() private readonly presupuestoService: PresupuestoService,
  ) {}
  
  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth('bearerAuth')
  async create(@Body() createPresupuestoDto: CreatePresupuestoDto) {
    return this.presupuestoService.create(createPresupuestoDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  @ApiBearerAuth('bearerAuth')
  async findAll( @Query() paginationDto: PaginationDto) {
    return this.presupuestoService.findAll(paginationDto);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiBearerAuth('bearerAuth')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.presupuestoService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiBearerAuth('bearerAuth')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updatePresupuestoDto: UpdatePresupuestoDto) {
    return this.presupuestoService.update(id, updatePresupuestoDto);
  }

  @UseGuards(AuthGuard)
  @Patch('/updateEstadoPresupuesto/:id')
  @ApiBearerAuth('bearerAuth')
  async updateEstado(@Param('id', ParseIntPipe) id: number, 
    @Body() estadoPresupuestoDto: EstadoPresupuestoDto) {
    
    const estado = estadoPresupuestoDto.estado as EstadoPresupuesto;

    // check valid status estado
    if (!estadoPresupuestoList.includes(estado)) {
      throw new BadRequestException({
        message: 'Estado inválido',
        estadosValidos: estadoPresupuestoList,
      });
    }
  
    const payload = {id, estado}
    return this.presupuestoService.cambiarEstadoPresupuesto(payload);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiBearerAuth('bearerAuth')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.presupuestoService.remove(id);
  }

  @UseGuards(AuthGuard)
  @Patch('enable/:id')
  @ApiBearerAuth('bearerAuth')
  async enable(@Param('id', ParseIntPipe) id: number) {
    return this.presupuestoService.enable(id);
  }

  @UseGuards(AuthGuard)
  @Get('getAllEstadosPresupuesto/:id')
  @ApiBearerAuth('bearerAuth')
  async getAllEstadosPresupuesto(@Param('id', ParseIntPipe) id: number) {
    return this.presupuestoService.getAllEstados(id);
  }

  @UseGuards(AuthGuard)
  @Get('findByProveedor/:id')
  @ApiBearerAuth('bearerAuth')
  async findByProveedr(@Param('id', ParseIntPipe) id: number) {
    return this.presupuestoService.findMyPresupuesto(id);
  }
  
  @UseGuards(AuthGuard)
  @Get('findBySolicitud/:id')
  @ApiBearerAuth('bearerAuth')
  async findBySolicitud(@Param('id', ParseIntPipe) id: number) {
    return this.presupuestoService.findPresupuestosBySolicitud(id);
  }

  @UseGuards(AuthGuard)
  @Get('findByProducto/:id')
  @ApiBearerAuth('bearerAuth')
  async findByProducto(@Param('id', ParseIntPipe) id: number) {
    return this.presupuestoService.findPresupuestosByProducto(id);
  }
}