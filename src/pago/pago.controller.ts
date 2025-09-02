import { Controller, Get, Post, Body, Param, Query, Inject, Redirect, Patch, ParseIntPipe, Delete, UseGuards } from '@nestjs/common';
import { estadoPagoDto, PagoDto, PagoPaginationDto } from './dto';
import { PagoStatus } from './enum/estadoPago.enum';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { PagoService } from './pago.service';

@Controller('pago')
@ApiTags('Pagos')
export class PagoController {
  constructor(@Inject() private readonly pagoService: PagoService) { }

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth('bearerAuth')
  @ApiBody({
    description: 'Create a new payment',
    type: PagoDto,
    examples: {
      example1: {
        summary: 'Example request',
        value: {
          monto: 100.5,
          estado: 'EN_PROCESO',
          metodoPago: 'Credit Card',
          usuario: 1,
          pedidoId: 1,
        },
      },
    },
  })
  create(@Body() createPagoDto: PagoDto) {
    return this.pagoService.create(createPagoDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  @ApiBearerAuth('bearerAuth')
  @ApiBody({
    description: 'Get all payments with pagination',
    type: PagoPaginationDto,
    examples: {
      example1: {
        summary: 'Example request',
        value: {
          page: 1,
          limit: 10,
        },
      },
    },
  })
  findAll(@Body() pagoPaginationDto: PagoPaginationDto) {
    return this.pagoService.findAll(pagoPaginationDto);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiBearerAuth('bearerAuth')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pagoService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiBearerAuth('bearerAuth')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pagoService.remove(id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiBody({
    description: 'Change the payment status',
    type: estadoPagoDto,
    examples: {
      example1: {
        summary: 'Example request',
        value: {
          id: 1,
          estado: 'PAGADO',
        },
      },
    },
  })
  @Patch()
  changeEstadoPago(@Body() dto: estadoPagoDto) {
    return this.pagoService.changeEstadoPago(dto); // <— NO te llames a vos misma/o
  }


  @UseGuards(AuthGuard)
  @Get('mp/:estado')
  @ApiBearerAuth('bearerAuth')
  changeEstadoPagoGet(@Param('estado') estado: string, @Query('id', ParseIntPipe) id: number) {
    if (estado === 'success') {
      const paraEnviar: estadoPagoDto = { id: id, estado: PagoStatus.PAGADO };
      return this.changeEstadoPago(paraEnviar);
    } else if (estado === 'failure') {
      const paraEnviar: estadoPagoDto = { id: id, estado: PagoStatus.PAGO_RECHAZADO };
      return this.changeEstadoPago(paraEnviar);
    } else {
      return 'Error';
    }
  }

  @UseGuards(AuthGuard)
  @Get('history/:id')
  @ApiBearerAuth('bearerAuth')
  getAllEstadosPago(@Param('id', ParseIntPipe) id: number) {
    return this.pagoService.getAllEstadosPago(id);
  }
}