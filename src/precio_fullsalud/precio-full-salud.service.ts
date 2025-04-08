import { HttpException, HttpStatus, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreatePrecioFullSaludDto } from './dto/create-precio-full-salud.dto';
import { UpdatePrecioFullSaludDto } from './dto/update-precio-full-salud.dto';
import { PaginationDto } from '../common';
import { prisma } from '../prisma/prisma-client';

@Injectable()
export class PrecioFullSaludService {

  private readonly logger = new Logger('PrecioFullSaludService')

  async create(createPrecioFullSaludDto: CreatePrecioFullSaludDto) {
    
    //buscar decuento habilitado
    const existingAvailablePrice = await prisma.descuentoProducto.findFirst({
      where: {
        productoId: createPrecioFullSaludDto.productoId,
        available: true,
      },
    });

    // Si existe, cambia `available` a false en el precio actual
    if (existingAvailablePrice) {
      await prisma.descuentoProducto.update({
        where: { id: existingAvailablePrice.id },
        data: { available: false },
      });
    }

     // Crear el nuevo precio con `available: true` y asociarlo al producto
     return prisma.descuentoProducto.create({
      data: {
        precioDescuento: createPrecioFullSaludDto.precioDescuento,
        available: true,
        producto: { connect: { id: createPrecioFullSaludDto.productoId } },
      },
    });
  }

  findAll(paginationDto: PaginationDto) {
    return prisma.descuentoProducto.findMany({
      include: { producto: true },
    });
  }

  findOne(id: number) {
    const precio = prisma.descuentoProducto.findUnique(
      { where: { id } }
    );
    if (!precio) {
      throw new HttpException('Precio Full Salud not found', HttpStatus.NOT_FOUND)
    }

    return precio;
  }

  async exists(id: number) {
    const descuentoProducto = await prisma.descuentoProducto.findFirst({
      where: { id }
    })

    if (!descuentoProducto) {
      throw new HttpException('Descuento Producto not found', HttpStatus.NOT_FOUND)
    }
    return true
  }

  async update(id: number, updatePrecioFullSaludDto: UpdatePrecioFullSaludDto) {
    await this.exists(id)
    const updated = await prisma.descuentoProducto.update({
      where: { id },
      data: {
        precioDescuento: updatePrecioFullSaludDto.precioDescuento
      }
    })
    return updated
  }

  async remove(id: number) {
    await this.exists(+id)

    return prisma.descuentoProducto.update({
      where: { id },
      data: { available: false }
    })
  }

  async makeAvailable(id: number) {
    await this.exists(id)

    return prisma.descuentoProducto.update({
      where: { id },
      data: { available: true }
    })
  }
}
