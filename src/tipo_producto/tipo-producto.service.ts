import { HttpException, HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateTipoProductoDto } from './dto/create-tipo-producto.dto';
import { UpdateTipoProductoDto } from './dto/update-tipo-producto.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class TipoProductoService extends PrismaClient implements OnModuleInit{
  
  private readonly logger = new Logger('TipoProductoService')

  onModuleInit() {
    this.$connect();
    this.logger.log('Databse connected')
  }


  create(createTipoProductoDto: CreateTipoProductoDto) {
    return this.tipoProducto.create({
      data: createTipoProductoDto
    })
  }

  async findAll() {
    const tipoProductos = await this.tipoProducto.findMany({
      where: {available: true},
      select: {
        id: true,
        nombreTipo: true,
        tiposRelacionados: {
          where: { available: true }, // Solo los tipos relacionados que estén habilitados
          select: {
            id: true,
            nombreTipo: true,
          },
        },
      },
    });
    return tipoProductos
  }

  async findOne(id: number) {
    const tipoProducto = await this.tipoProducto.findFirst({
      where:{
        id:id , available: true
    },
    select: {
      id: true,
      nombreTipo: true,
      tiposRelacionados: {
        where: { available: true }, // Solo los tipos relacionados que estén habilitados
        select: {
          id: true,
          nombreTipo: true,
        },
      },
    },
  })

    if(!tipoProducto){
      throw new HttpException(`Tipo producto with id ${id} was not found`, HttpStatus.NOT_FOUND)
    }
    return tipoProducto
  }

  async exists(id: number) {
    const tipoProducto = await this.tipoProducto.findFirst({
      where:{
        id:id
      }
    })

    if(!tipoProducto){
      throw new HttpException(`Tipo producto with id ${id} was not found`, HttpStatus.NOT_FOUND)
    }
    return true
  }

  async update(id: number, updateTipoProductoDto: UpdateTipoProductoDto) {
    await this.findOne(id)
    
    return this.tipoProducto.update({
      where:{id: id}, 
      data: updateTipoProductoDto
    })
  }

  async remove(id: number) {
    await this.findOne(id)
    
    return this.tipoProducto.update({
      where:{id}, 
      data:{available: false}
    })
  }

  async updateToAvailable(id: number) {
    await this.exists(id)
    
    return this.tipoProducto.update({
      where:{id}, 
      data: {available: true}
    })
  }


}
