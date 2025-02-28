import { HttpException, HttpStatus, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateTiposUsoDto } from './dto/create-tipos-uso.dto';
import { UpdateTiposUsoDto } from './dto/update-tipos-uso.dto';
import { PrismaClient } from '@prisma/client';
import { ProductsService } from '../products/products.service';

@Injectable()
export class TiposUsoService extends PrismaClient implements OnModuleInit{

  private readonly logger = new Logger('DescripcionService')

  constructor(private readonly productsService: ProductsService) {
    super();
  }

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected')
  }

  create(createTiposUsoDto: CreateTiposUsoDto) {
    return this.tipoUso.create({
      data: createTiposUsoDto,
    })
  }

  findAll() {
    return this.tipoUso.findMany();
  }

  async findOne(id: number) {
    const tipoUso = await this.tipoUso.findFirst({
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

    return this.tipoUso.update({
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

    return this.tipoUso.update({
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

    return this.tipoUso.update({
      where: {id},
      data:{
        available: true
      }
    })
  }
}
