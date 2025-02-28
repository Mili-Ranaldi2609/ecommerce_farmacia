import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PaginationDto } from '../common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
    return this. precioFullSaludService.findAll(paginationDto);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiBearerAuth('bearerAuth')
  async findOne(@Param('id') id: string) {
    
  }

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth('bearerAuth')
  create(@Body() createPrecioFullsaludDto: CreatePrecioFullSaludDto) {
    
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiBearerAuth('bearerAuth')
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updatePrecioFullsaludDto: UpdatePrecioFullSaludDto) {
      
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiBearerAuth('bearerAuth')
  async remove(@Param('id') id: string) {
    
  }

  @UseGuards(AuthGuard)
  @Patch('/enable/:id')
  @ApiBearerAuth('bearerAuth')
  async enable(@Param('id') id: string) {
    
  }
}
