import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { CreateProveedoreDto } from './dto/create-proveedore.dto';
import { UpdateProveedoreDto } from './dto/update-proveedore.dto';
import { PaginationDto } from '../common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { ProveedoresService } from './proveedores.service';

@Controller('proveedores')
@ApiTags('Proveedores')
export class ProveedoresController {
  constructor(@Inject() private readonly proveedorService: ProveedoresService) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth('bearerAuth')
  @ApiBody({
    description: 'Create a new proveedor',
    type: CreateProveedoreDto,
    examples: {
      example1: {
        summary: 'Example request',
        value: {
          nombre: 'Proveedor A',
          email: 'proveedorA@example.com',
          telefono: '1234567890',
        },
      },
    },
  })
  create(@Body() createProveedoreDto: CreateProveedoreDto) {
    return this.proveedorService.create(createProveedoreDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  @ApiBearerAuth('bearerAuth')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.proveedorService.findAll(paginationDto);
  }

  @UseGuards(AuthGuard)
  @Get('/:id')
  @ApiBearerAuth('bearerAuth')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.proveedorService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch('/:id')
  @ApiBearerAuth('bearerAuth')
  @ApiBody({
    description: 'Update a proveedor',
    type: UpdateProveedoreDto,
    examples: {
      example1: {
        summary: 'Example request',
        value: {
          nombre: 'Updated Proveedor A',
          email: 'updatedProveedorA@example.com',
          telefono: '0987654321',
        },
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProveedoreDto: UpdateProveedoreDto,
  ) {
    return this.proveedorService.update(id, updateProveedoreDto);
  }

  @UseGuards(AuthGuard)
  @Delete('/:id')
  @ApiBearerAuth('bearerAuth')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.proveedorService.remove(id);
  }
}
