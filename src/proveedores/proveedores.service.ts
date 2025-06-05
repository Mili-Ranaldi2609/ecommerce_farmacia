import { HttpException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProveedoreDto } from './dto/create-proveedore.dto';
import { UpdateProveedoreDto } from './dto/update-proveedore.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { prisma } from '../prisma/prisma-client';

@Injectable()
export class ProveedoresService {
  private readonly logger = new Logger('ProveedoresService');

  async create(createProveedoreDto: CreateProveedoreDto) {
    try {

      const { email, telefono } = createProveedoreDto;

      const Proveedorexistente = await prisma.proveedores.findFirst({
        where: { OR: [{ email }, { telefono }] },
      });

      if (Proveedorexistente) {
        throw new Error(
          'El proveedor ya existe con el email o teléfono proporcionado.',
        );
      }

      const proveedore = prisma.proveedores.create({
        data: createProveedoreDto,
      });

      return proveedore;
    } catch (error) {
      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { page = 1, limit = 10 } = paginationDto;
      const totalProveedores = await prisma.proveedores.count({
        where: { available: true },
      });

      const totalPages = Math.ceil(totalProveedores / limit);
      const proveedores = await prisma.proveedores.findMany({
        where: { available: true },
        skip: (page - 1) * limit,
        take: paginationDto.limit,
        select: {
          id: true,
          nombre: true,
          email: true,
          telefono: true,
        },
      });
      return {
        data: proveedores,
        meta: {
          total: totalProveedores,
          pages: totalPages,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {

      const proveedor = await prisma.proveedores.findUnique({
        where: { id: id, available: true },
        select: {
          nombre: true,
          email: true,
          telefono: true,
        },
      });

      if (!proveedor) {
        throw new Error(`Proveedor con id ${id} no encontrado`);
      }
      return proveedor;
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async update(id: number, updateProveedoreDto: UpdateProveedoreDto) {

    try {
      await this.findOne(id);

      const proveedor = await prisma.proveedores.update({
        where: { id: id, available: true },
        data: updateProveedoreDto,
      });

      return proveedor;
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id);

      const proveedor = await prisma.proveedores.update({
        where: { id: id, available: true },
        data: { available: false },
      });

      return proveedor;
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }
}
