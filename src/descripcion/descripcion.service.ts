import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { UpdateDescripcionDto } from './dto/update-descripcion.dto';
import { ProductsService } from '../products/products.service';
import { prisma } from '../prisma/prisma-client';


@Injectable()
export class DescripcionService {

  private readonly logger = new Logger('DescripcionService')

  constructor(private readonly productsService: ProductsService) {}

  async findOne(id: number) {
    const descripcion = await prisma.descripcion.findFirst({
      where: {id}
    })
    if (!descripcion) {
      throw new NotFoundException(`Descripcion with id ${id} was not found`);
    }
    return descripcion;
  }

  async update(id: number, updateDescripcionDto: UpdateDescripcionDto) {
    const {idProducto, descripcion, caracteristicas } = updateDescripcionDto

    const producto = await this.productsService.findOne(idProducto);
    if (!producto){
      throw new NotFoundException('El producto no fue encontrado');
    }

    const descripcionToUpdate = this.findOne(id)
    if(!descripcionToUpdate){
      throw new NotFoundException('La descripcion no fue encontrada');
    }

    return prisma.descripcion.update({
      where:{id},
      data:{
        descripcion,
        caracteristicas
      }
    })

  }

  async remove(id: number) {

    const descripcionToRemove = await this.findOne(id)
    if(!descripcionToRemove){
      throw new NotFoundException('La descripcion no fue encontrada');
    }

    return prisma.descripcion.update({
      where:{id},
      data:{
        available: false
      }
    })

  }

  async makeAvailable(id: number) {

    const descripcionToRemove = await this.findOne(id)
    if(!descripcionToRemove){
      throw new NotFoundException('La descripcion no fue encontrada');
    }

    return prisma.descripcion.update({
      where:{id},
      data:{
        available: true
      }
    })

  }

}
