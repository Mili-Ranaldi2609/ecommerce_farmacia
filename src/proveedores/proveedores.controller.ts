import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  Query,
  ParseIntPipe,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { CreateProveedoreDto } from './dto/create-proveedore.dto';
import { UpdateProveedoreDto } from './dto/update-proveedore.dto';
import { PaginationDto } from '../common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProveedoresService } from './proveedores.service';

@Controller('proveedores')
@ApiTags('Proveedores')
export class ProveedoresController {
  constructor(@Inject() private readonly proveedorService: ProveedoresService ) {}
  private logger = new Logger(ProveedoresController.name);

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth('bearerAuth')
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
