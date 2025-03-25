import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UpdateTiposUsoDto } from './dto/update-tipos-uso.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { TiposUsoService } from './tipos-uso.service';

@Controller('tipos-uso')
@ApiTags('Tipos-Uso')
export class TiposUsoController {
  constructor(@Inject() private readonly tipoUsoService: TiposUsoService) {}

  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiBearerAuth('bearerAuth')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tipoUsoService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiBearerAuth('bearerAuth')
  @ApiBody({
    description: 'Update a tipo-uso',
    type: UpdateTiposUsoDto,
    examples: {
      example1: {
        summary: 'Example request',
        value: {
          nombre: 'Updated Tipo Uso',
          descripcion: 'Updated description for tipo-uso',
        },
      },
    },
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTiposUsoDto: UpdateTiposUsoDto,
  ) {
    return this.tipoUsoService.update(id, updateTiposUsoDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiBearerAuth('bearerAuth')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.tipoUsoService.remove(id);
  }

  @UseGuards(AuthGuard)
  @Patch('enable/:id')
  @ApiBearerAuth('bearerAuth')
  async enable(@Param('id', ParseIntPipe) id: number) {
    return this.tipoUsoService.makeAvailable(id);
  }
}
