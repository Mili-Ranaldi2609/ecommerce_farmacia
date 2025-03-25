import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PaginationDto } from '../common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { PrecioFullSaludService } from './precio-full-salud.service';
import { CreatePrecioFullSaludDto } from './dto/create-precio-full-salud.dto';
import { UpdatePrecioFullSaludDto } from './dto/update-precio-full-salud.dto';

@Controller('precio-fullsalud')
@ApiTags('Precio-FullSalud')
export class PrecioFullsaludController {
  constructor(@Inject() private readonly precioFullSaludService: PrecioFullSaludService) {}

  @UseGuards(AuthGuard)
  @Get()
  @ApiBearerAuth('bearerAuth')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.precioFullSaludService.findAll(paginationDto);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiBearerAuth('bearerAuth')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.precioFullSaludService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth('bearerAuth')
  @ApiBody({
    description: 'Create a new Precio-FullSalud entry',
    type: CreatePrecioFullSaludDto,
    examples: {
      example1: {
        summary: 'Example request',
        value: {
          nombre: 'FullSalud Plan A',
          precio: 150.75,
          descripcion: 'This is a description for Plan A.',
        },
      },
    },
  })
  create(@Body() createPrecioFullsaludDto: CreatePrecioFullSaludDto) {
    return this.precioFullSaludService.create(createPrecioFullsaludDto);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiBearerAuth('bearerAuth')
  @ApiBody({
    description: 'Update a Precio-FullSalud entry',
    type: UpdatePrecioFullSaludDto,
    examples: {
      example1: {
        summary: 'Example request',
        value: {
          nombre: 'Updated FullSalud Plan A',
          precio: 200.50,
          descripcion: 'This is an updated description for Plan A.',
        },
      },
    },
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePrecioFullsaludDto: UpdatePrecioFullSaludDto,
  ) {
    return this.precioFullSaludService.update(id, updatePrecioFullsaludDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiBearerAuth('bearerAuth')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.precioFullSaludService.remove(id);
  }

  @UseGuards(AuthGuard)
  @Patch('/enable/:id')
  @ApiBearerAuth('bearerAuth')
  async enable(@Param('id', ParseIntPipe) id: number) {
    return this.precioFullSaludService.makeAvailable(id);
  }
}
