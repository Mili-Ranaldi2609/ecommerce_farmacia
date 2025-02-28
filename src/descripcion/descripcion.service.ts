import { HttpStatus, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateDescripcionDto } from './dto/create-descripcion.dto';
import { UpdateDescripcionDto } from './dto/update-descripcion.dto';
import { PrismaClient } from '@prisma/client';
import { ProductsService } from '../products/products.service';

@Injectable()
export class DescripcionService extends PrismaClient implements OnModuleInit{

  private readonly logger = new Logger('DescripcionService')

  constructor(private readonly productsService: ProductsService) {
    super();
  }

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected')
  }

  //no se usa, create se hace con producto y get all no se usa aun
  // create(createDescripcionDto: CreateDescripcionDto) {
  //   return 'This action adds a new descripcion';
  // }

  // findAll() {
  //   return `This action returns all descripcion`;
  // }

  async findOne(id: number) {
    const descripcion = await this.descripcion.findFirst({
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

    return this.descripcion.update({
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

    return this.descripcion.update({
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

    return this.descripcion.update({
      where:{id},
      data:{
        available: true
      }
    })

  }

}
