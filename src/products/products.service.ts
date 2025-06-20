import {
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UpdateProductoDataDto } from './dto/updateProductoData,dto';
import { prisma } from '../prisma/prisma-client';
import { SearchProductDto } from './dto/search-product.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductService');
  
 

  async create(data: CreateProductDto) {
    const {
      categoriaIds,
      tipoProductoId,
      descripcion,
      tiposDeUso,
      proveedorId,
      ...productData
    } = data;

    const array = data.categoriaIds || [];
    const lengthArray = array.length;

    const createdDescripcion = await prisma.descripcion.create({
      data: {
        descripcion: descripcion.descripcion,
        caracteristicas: descripcion.caracteristicas,
      },
    });

    // Crear el tipo de uso
    const createdTipoUso = await prisma.tipoUso.create({
      data: {
        descripcion: tiposDeUso.descripcion,
        tiposDeUso: tiposDeUso.tiposDeUso,
      },
    });

    const producto = await prisma.product.create({
      data: {
        ...productData,
        tipoProducto: {
          connect: { id: tipoProductoId },
        },
        categorias: {
          create: (categoriaIds ?? []).map((categoriaId) => ({
            categoria: {
              connect: { id: categoriaId },
            },
          })),
        },
        descripcion: {
          connect: {
            id: createdDescripcion.id,
          },
        },
        tiposDeUso: {
          connect: {
            id: createdTipoUso.id,
          },
        },
       proveedor: proveedorId
          ? { connect: { id: proveedorId } }
          : undefined,
      },
      include: {
        categorias: { include: { categoria: true } },
        tipoProducto: true,
        descripcion: true,
        tiposDeUso: true,
      },
    });

    return producto;
  }

 

  async findOne(id: number) {
    const product = await prisma.product.findFirst({
      where: { id, available: true },
      include: {
        categorias: {
          include: {
            categoria: {
              select: {
                id: true,
                nombreCategoria: true,
              },
            },
          },
        },
        tipoProducto: {
          select: {
            id: true,
            nombreTipo: true,
            tipoPadreId: true,
          },
        },
        descuento: {
          where: { available: true },
          select: {
            id: true,
            precioDescuento: true,
          },
          take: 1, // Solo toma el primer descuento disponible
        },
        descripcion: true, // Incluye toda la descripción
        tiposDeUso: true, // Incluye todos los tipos de uso
      },
    });

    if (!product) {
      throw new HttpException(
        `Product with id ${id} was not found`,404
      );
    }

    // Filtrar las relaciones relacionadas manualmente
    return {
      ...product,
      descripcion: product.descripcion?.available
        ? {
            id: product.descripcion.id,
            descripcion: product.descripcion.descripcion,
            caracteristicas: product.descripcion.caracteristicas,
          }
        : null,
      tiposDeUso: product.tiposDeUso?.available
        ? {
            id: product.tiposDeUso.id,
            descripcion: product.tiposDeUso.descripcion,
            tiposDeUso: product.tiposDeUso.tiposDeUso,
          }
        : null,
    };
  }

  async exists(id: number) {
    const product = await prisma.product.findFirst({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product you want was not found');
    }
    return product;
  }

 async update(id: number, updateProductDto: UpdateProductoDataDto) {
    const { categoriasIds, tipoProductoId, descripcion, ...data } = updateProductDto;

    const productToUpdate = await this.findOne(id);
    if (!productToUpdate) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }

    let descriptionRelationData = {};

    if (descripcion) { 
      if (productToUpdate.descripcion) {
        descriptionRelationData = {
          descripcion: {
            update: {
              descripcion: descripcion.descripcion,
              caracteristicas: descripcion.caracteristicas,
            },
          },
        };
      } else {
        descriptionRelationData = {
          descripcion: {
            create: {
              descripcion: descripcion.descripcion,
              caracteristicas: descripcion.caracteristicas,
              available: true, 
            },
          },
        };
      }
    }

    return prisma.product.update({
      where: { id },
      data: {
        ...data, // nombre, precio, marca, stock
        ...descriptionRelationData, // Lógica para la relación 'descripcion'
        ...(categoriasIds && {
          categorias: {
            deleteMany: {},
            create: categoriasIds?.map((categoriaId) => ({
              categoria: {
                connect: { id: categoriaId },
              },
            })),
          },
        }),
        ...(tipoProductoId && {
          tipoProducto: {
            connect: { id: tipoProductoId },
          },
        }),
      },
    });
  }

  async updateAvailable(id: number) {
    const productToUpdate = await this.exists(id);
    if (!productToUpdate) {
      throw new NotFoundException('Product you want to update was not found');
    }

    return prisma.product.update({
      where: { id },
      data: {
        available: true,
      },
    });
  }


  async remove(id: number) {
    await this.findOne(id);
    const product = await prisma.product.update({
      where: { id },
      data: {
        available: false,
      },
    });

    return product;
  }


  // ¡ESTE ES TU NUEVO Y MEJORADO searchProducts general!
  async searchProducts(queryDto: SearchProductDto, paginationDto: PaginationDto) {
    const where: any = {
      available: true, // Asumimos que por defecto solo se buscan productos disponibles
    };

    // Aplicar filtros basados en los parámetros del queryDto
    if (queryDto.nombre) {
      where.nombre = { contains: queryDto.nombre, mode: 'insensitive' };
    }
    if (queryDto.marca) {
      where.marca = { contains: queryDto.marca, mode: 'insensitive' };
    }
    if (queryDto.available !== undefined) {
      where.available = queryDto.available;
    }

    // Lógica para el rango de precios (del pull request de tu jefe, ahora generalizado)
    if (queryDto.precioMin !== undefined && queryDto.precioMax !== undefined) {
      where.precio = {
        gte: queryDto.precioMin,
        lte: queryDto.precioMax,
      };
    } else if (queryDto.precioMin !== undefined) {
      where.precio = {
        gte: queryDto.precioMin,
      };
    } else if (queryDto.precioMax !== undefined) {
      where.precio = {
        lte: queryDto.precioMax,
      };
    }

    // ¡Aquí se utiliza tu función auxiliar para ejecutar la búsqueda!
    return this.getProductsWithIncludesAndDto(where, paginationDto);
  }


    private async getProductsWithIncludesAndDto(
    whereClause: any,
    paginationDto?: PaginationDto, 
  ) {
    const page = paginationDto?.page ?? 1;
    const limit = paginationDto?.limit ?? 10;
    const skip = paginationDto ? (page - 1) * limit : undefined;
    const take = paginationDto ? limit : undefined;

    const total = await prisma.product.count({ where: whereClause });
    const lastPage = paginationDto ? Math.ceil(total / (paginationDto.limit ?? 10)) : 1;
    const currentPage = paginationDto ? paginationDto.page : 1;

    const products = await prisma.product.findMany({
      skip: skip,
      take: take,
      where: whereClause,
      include: {
        categorias: {
          include: {
            categoria: {
              select: {
                id: true,
                nombreCategoria: true,
              },
            },
          },
        },
        tipoProducto: {
          select: {
            id: true,
            nombreTipo: true,
            tipoPadreId: true,
          },
        },
        descuento: {
          where: {
            available: true,
          },
          select: {
            id: true,
            precioDescuento: true,
          },
          take: 1,
        },
        descripcion: true,
        tiposDeUso: true,
      },
    });

    const productsDto = products.map((producto) => {
      const descuento = producto.descuento[0];
      return {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        marca: producto.marca,
        stock: producto.stock,
        available: producto.available,
        categorias: producto.categorias.map((cat) => ({
          id: cat.categoria.id,
          nombreCategoria: cat.categoria.nombreCategoria,
        })),
        tipoProducto: {
          id: producto.tipoProducto?.id ?? null,
          nombreTipo: producto.tipoProducto?.nombreTipo,
          tipoPadreId: producto.tipoProducto?.tipoPadreId,
        },
        descuento: descuento
          ? {
              id: descuento.id,
              precioDescuento: descuento.precioDescuento,
            }
          : null,
        descripcion: producto.descripcion?.available
          ? {
              id: producto.descripcion.id,
              descripcion: producto.descripcion.descripcion,
              caracteristicas: producto.descripcion.caracteristicas,
            }
          : null,
        tiposDeUso: producto.tiposDeUso?.available
          ? {
              id: producto.tiposDeUso.id,
              descripcion: producto.tiposDeUso.descripcion,
              tiposDeUso: producto.tiposDeUso.tiposDeUso,
            }
          : null,
      };
    });

    return {
      productos: productsDto,
      meta: {
        total: total,
        page: currentPage,
        lastPage: lastPage,
      },
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const whereClause = { available: true };
    return this.getProductsWithIncludesAndDto(whereClause, paginationDto);
  }

  async getProductByCategory(
    categoriaId: number,
    paginationDto: PaginationDto,
  ) {
    const whereClause = {
      categorias: { some: { categoriaId: categoriaId } },
      available: true,
    };
    return this.getProductsWithIncludesAndDto(whereClause, paginationDto);
  }


  async getProductsByTipoProducto(
    tipoProductoId: number,
    paginationDto: PaginationDto,
  ) {
    const whereClause = {
      tipoProductoId,
      available: true,
    };
    return this.getProductsWithIncludesAndDto(whereClause, paginationDto);
  }

  async validateProducts(ids: number[]) {
    ids = Array.from(new Set(ids));

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    if (products.length !== ids.length) {
       ('hola longitudes no iguales');
      throw new NotFoundException('Some products were not found');
    }

    return products;
  }
}
