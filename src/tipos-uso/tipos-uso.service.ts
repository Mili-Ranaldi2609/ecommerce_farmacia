import { HttpException, HttpStatus, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateTiposUsoDto } from './dto/create-tipos-uso.dto';
import { UpdateTiposUsoDto } from './dto/update-tipos-uso.dto';
import { ProductsService } from '../products/products.service';
import { prisma } from '../prisma/prisma-client';

@Injectable()
export class TiposUsoService {

  private readonly logger = new Logger('DescripcionService')

  constructor(private readonly productsService: ProductsService) {}

  create(createTiposUsoDto: CreateTiposUsoDto) {
    return prisma.tipoUso.create({
      data: createTiposUsoDto,
    })
  }

  findAll() {
    return prisma.tipoUso.findMany();
  }

  async findOne(id: number) {
    const tipoUso = await prisma.tipoUso.findFirst({
      where: {id}
    })
    if(!tipoUso){
      throw new HttpException(`Tipo Uso with id ${id} was not found`, HttpStatus.BAD_REQUEST)

    }
    return tipoUso
  }

  async update(id: number, updateTiposUsoDto: UpdateTiposUsoDto) {
    const {idProducto, descripcion, tiposDeUso} = updateTiposUsoDto
    if (idProducto === undefined) {
      throw new HttpException('idProducto is undefined', HttpStatus.BAD_REQUEST);
    }
    const producto = await this.productsService.findOne(idProducto);

    if (!producto){
      throw new HttpException(`Producto with id ${id} was not found`, HttpStatus.BAD_REQUEST)

    }

    const tipoDeUsoToUpdate = this.findOne(id)
    if(!tipoDeUsoToUpdate){
      throw new NotFoundException('La descripcion no fue encontrada');
    }

    return prisma.tipoUso.update({
      where: {id},
      data:{
        descripcion, tiposDeUso
      }
    })
  }

  async remove(id: number) {
    const tipoDeUsoToRemove = await this.findOne(id);

    if(!tipoDeUsoToRemove){
      throw new NotFoundException('La descripcion no fue encontrada');
    }

    if(tipoDeUsoToRemove.available === false)
      {
        //check message?
        return {
          message: `Tipo de uso ${id} is already disable!!`
        }
      }

    return prisma.tipoUso.update({
      where: {id},
      data:{
        available: false
      }
    })
  }

  async makeAvailable(id: number) {
    const tipoDeUsoToEnable = await this.findOne(id)
    if(!tipoDeUsoToEnable){
      throw new NotFoundException('La descripcion no fue encontrada');
    }
    if(tipoDeUsoToEnable.available === true)
    {
      return {
        message: `Tipo de uso ${id} is already available!!`
      }
    }

    return prisma.tipoUso.update({
      where: {id},
      data:{
        available: true
      }
    })
  }
}
