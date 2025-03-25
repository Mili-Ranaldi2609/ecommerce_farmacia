import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, ParseIntPipe, UseInterceptors, UseGuards } from '@nestjs/common';
import { CreateDescripcionDto } from './dto/create-descripcion.dto';
import { UpdateDescripcionDto } from './dto/update-descripcion.dto';
import { SanitizeInterceptor } from '../common/sanitize.interceptor';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { DescripcionService } from './descripcion.service';

@Controller('descripcion')
@ApiTags('Descripciones')
export class DescripcionController {
  constructor(
    @Inject() private readonly descripcionService: DescripcionService,
  ) {}

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
  @ApiBody({
    description: 'Update a description',
    type: UpdateDescripcionDto,
    examples: {
      example1: {
        summary: 'Example request',
        value: {
          descripcion: 'This is an updated description.',
          caracteristicas: ['Feature 1', 'Feature 2', 'Feature 3'],
        },
      },
    },
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDescripcionDto: UpdateDescripcionDto,
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
