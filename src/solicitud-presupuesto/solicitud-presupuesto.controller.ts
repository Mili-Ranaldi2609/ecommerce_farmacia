import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CreateSolicitudPresupuestoDto } from './dto/create-solicitud-presupuesto.dto';
import { UpdateSolicitudPresupuestoDto } from './dto/update-solicitud-presupuesto.dto';
import { PaginationDto } from '../common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SolicitudPresupuestoService } from './solicitud-presupuesto.service';
import { EstadoSolicitudDto } from './dto';

@Controller('solicitud-presupuesto')
@ApiTags('Solicitudes-Presupuesto')
export class SolicitudPresupuestoController {
   constructor(@Inject() private readonly solicitudService: SolicitudPresupuestoService) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth('bearerAuth')
  createSolicitud(@Body() createSolicitud: CreateSolicitudPresupuestoDto){
    return this.solicitudService.create(createSolicitud);
  }

  @UseGuards(AuthGuard)
  @Get()
  @ApiBearerAuth('bearerAuth')
  findAll( @Query() paginationDto: PaginationDto) {
    return this.solicitudService.findAll(paginationDto);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiBearerAuth('bearerAuth')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.solicitudService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch('update/:id')
  @ApiBearerAuth('bearerAuth')
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateSolicitudPresupuestoDto: UpdateSolicitudPresupuestoDto) {
    return this.solicitudService.update(id, updateSolicitudPresupuestoDto);
  }

  @UseGuards(AuthGuard)
  @Patch('/changeStatusSolicitud/:id')
  @ApiBearerAuth('bearerAuth')
  async changeEstadoSolicitud(@Param('id', ParseIntPipe) id: number, @Body() estadoSolicitudDto: EstadoSolicitudDto) {
    estadoSolicitudDto.id = id;
    return this.solicitudService.cambiarEstadoSolicitud(estadoSolicitudDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiBearerAuth('bearerAuth')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.remove(id);
  }

  @UseGuards(AuthGuard)
  @Patch('/available/:id')
  @ApiBearerAuth('bearerAuth')
  async makeAvailableSolicitd(
    @Param('id', ParseIntPipe) id: number){
    return this.solicitudService.enable(id);
  }

  @UseGuards(AuthGuard)
  @Get('getAllEstadosSolicitud/:id')
  @ApiBearerAuth('bearerAuth')
  async getAllEstadosSolicitud(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.getAllEstados(id);
  }

  @UseGuards(AuthGuard)
  @Get('getSolicitudesByUser/:id')
  @ApiBearerAuth('bearerAuth')
  async getSolicitudesByUser(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.getSolicitudesByUser(id);
  }

  @UseGuards(AuthGuard)
  @Get('getSolicitudesByProducto/:id')
  @ApiBearerAuth('bearerAuth')
  async findSolicitudesByProduct(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.getSolicitudesByProduct(id);
  }
}