import { HttpException, HttpStatus, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class CategoriaService extends PrismaClient implements OnModuleInit{

  private readonly logger = new Logger('CategoriaService')

  onModuleInit() {
    this.$connect();
    this.logger.log('Databse connected')
  }


  //crear categoria
  create(createCategoriaDto: CreateCategoriaDto) {
    console.log('servicio create categoria recibida: ', createCategoriaDto)
    return this.categoria.create({
      data: createCategoriaDto
    })
  }

  //buscar todas categorias
  findAll() {
    return this.categoria.findMany({
      where: { available: true }
    })
  }

  //buscar una categoria
  async findOne(id: number) {
    const categoria = await this.categoria.findFirst({
      where:{id, available: true}
    })
    console.log('servicio categoria get one: ', categoria )

    
    if(!categoria){
      //throw new RpcException(`Product with id ${id} was not found`);
      throw new HttpException('Categoria not found', 400);
    }
    return categoria
  }

  //existe categoria
  async exists(id: number) {
    const categoria = await this.categoria.findFirst({
      where: {id}
    });
    console.log('findOne: ', categoria)

    if(!categoria){
      throw new NotFoundException('Categoria you want was not found');
    }
    return categoria
  }

  //update categoria
  async update(id: number, updateCategoriaDto: UpdateCategoriaDto) {
    const {id: _, ...data} = updateCategoriaDto
    const categoriaToUpdate = await this.findOne(id)

    if(!categoriaToUpdate){
      throw new NotFoundException('Categoria you want to update was not found');
    }

    return this.categoria.update({
      where:{ id}, 
      data: data,
    })
  }

  //habilitar categoria
  async updateAvailable(id: number) {

    const categoriaToUpdate = await this.exists(id)
    if(!categoriaToUpdate){
      throw new NotFoundException('Categoria you want to update was not found');
    }

    return this.categoria.update({
      where:{ id }, 
      data:{
      available: true
      }
    })
    //return `This action updates a #${id} product`;
  }

  //eliminacion suave
  async remove(id: number) {
    await this.findOne(id)
    const categoria = await this.categoria.update({
      where:{id},
      data:{
        available: false
      }
    })
    
    return categoria
  }
}
