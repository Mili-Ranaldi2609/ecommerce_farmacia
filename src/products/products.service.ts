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

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10} = paginationDto;

    const totalPages = await prisma.product.count({ where: { available: true } });
    const lastPage = Math.ceil(totalPages / limit);

    // Obtén los datos del producto
    const products = await prisma.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { available: true },
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
          select: {
            id: true,
            precioDescuento: true,
          },
        },
        descripcion: true, // Incluye todo, filtramos manualmente después
        tiposDeUso: true, // Incluye todo, filtramos manualmente después
      },
    });

    // Filtrar `descripcion` y `tiposDeUso` con `available: true`
    const filteredProducts = products.map((product) => ({
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
    }));

    return {
      data: filteredProducts,
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage,
      },
    };
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
    // Desestructuramos el DTO para obtener las categorías (si existen) y los demás datos del producto
    const { categoriasIds, tipoProductoId, ...data } = updateProductDto;
    // Primero buscamos el producto a actualizar
    const productToUpdate = await this.findOne(id);
    if (!productToUpdate) {
    }

    //TODO check if exists tipoProducto y categoria to update producto
    // Realizamos la actualización del producto
    return prisma.product.update({
      where: { id }, // Producto a actualizar
      data: {
        ...data,
        // Manejamos las categorías a través de la tabla intermedia
        ...(categoriasIds && {
          categorias: {
            // Eliminar relaciones anteriores en la tabla intermedia
            deleteMany: {},

            // Crear nuevas relaciones
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

  //eliminacion suave
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

  // Get products by category with pagination
  async getProductByCategory(
    categoriaId: number,
    paginationDto: PaginationDto,
  ) {
    const { page = 1, limit = 10 } = paginationDto;

    // Total de productos disponibles que pertenecen a la categoría
    const totalPages = await prisma.product.count({
      where: {
        categorias: {
          some: {
            categoriaId: categoriaId,
          },
        },
        available: true, // Asegúrate de que solo los productos disponibles sean retornados
      },
    });

    const lastPage = Math.ceil(totalPages / limit); // Calcula la última página

    // Obtén los productos con las relaciones y paginación
    const products = await prisma.product.findMany({
      skip: (page - 1) * limit, // Saltar los productos anteriores según la página
      take: limit, // Limitar los productos por el tamaño de la página
      where: {
        categorias: {
          some: {
            categoriaId: categoriaId,
          },
        },
        available: true, // Asegúrate de que solo los productos disponibles sean retornados
      },
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
          take: 1, // Solo toma el primer descuento disponible
        },
        descripcion: true, // Incluye toda la descripción
        tiposDeUso: true, // Incluye todos los tipos de uso
      },
    });

    // Mapear los resultados al formato esperado
    const productsDto = products.map((producto) => {
      const descuento = producto.descuento[0]; // Tomar el primer descuento disponible, si existe
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

    // Retorna los productos junto con la información de paginación
    return {
      products: productsDto,
      meta: {
        total: totalPages, // Total de productos disponibles
        page: page, // Página actual
        lastPage: lastPage, // Última página
      },
    };
  }

  async buscarProductosPorNombre(nombre: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    // Total de productos que coinciden con el nombre y están disponibles
    const totalPages = await prisma.product.count({
      where: {
        nombre: {
          contains: nombre, // Búsqueda parcial (case-insensitive)
          mode: 'insensitive', // Opción para ignorar mayúsculas y minúsculas
        },
        available: true, // Solo productos disponibles
      },
    });

    const lastPage = Math.ceil(totalPages / limit); // Calcula la última página

    // Obtiene los productos con las relaciones y paginación
    const productos = await prisma.product.findMany({
      skip: (page - 1) * limit, // Saltar los productos de las páginas anteriores
      take: limit, // Limitar los productos por el tamaño de la página
      where: {
        nombre: {
          contains: nombre, // Búsqueda parcial (case-insensitive)
          mode: 'insensitive', // Opción para ignorar mayúsculas y minúsculas
        },
        available: true, // Solo productos disponibles
      },
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
          take: 1, // Solo toma el primer descuento disponible
        },
        descripcion: true,
        tiposDeUso: true,
      },
    });

    // Mapea los resultados a un DTO
    const productosDto = productos.map((producto) => {
      const descuento = producto.descuento[0]; // Tomar el primer descuento disponible, si existe
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

    // Retorna los productos junto con la información de paginación
    return {
      productos: productosDto,
      meta: {
        total: totalPages, // Total de productos encontrados
        page: page, // Página actual
        lastPage: lastPage, // Última página
      },
    };
  }

  async getProductsByTipoProducto(
    tipoProductoId: number,
    paginationDto: PaginationDto,
  ) {
    const { page = 1, limit = 10 } = paginationDto;

    // Total de productos que coinciden con el tipo de producto y están disponibles
    const totalPages = await prisma.product.count({
      where: {
        tipoProductoId,
        available: true, // Solo productos disponibles
      },
    });

    const lastPage = Math.ceil(totalPages / limit); // Calcula la última página

    // Obtiene los productos con las relaciones y paginación
    const productos = await prisma.product.findMany({
      skip: (page - 1) * limit, // Saltar los productos de las páginas anteriores
      take: limit, // Limitar los productos por el tamaño de la página
      where: {
        tipoProductoId,
        available: true, // Solo productos disponibles
      },
      include: {
        categorias: {
          select: {
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
            available: true, // Solo descuentos disponibles
          },
          select: {
            id: true,
            precioDescuento: true,
          },
        },
        descripcion: true,
        tiposDeUso: true,
      },
    });

    // Mapea los resultados a un DTO
    const productosDto = productos.map((producto) => {
      const descuento = producto.descuento[0]; // Tomar el primer descuento disponible, si existe
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

    // Retorna los productos junto con la información de paginación
    return {
      productos: productosDto,
      meta: {
        total: totalPages, // Total de productos encontrados
        page: page, // Página actual
        lastPage: lastPage, // Última página
      },
    };
  }

  //No funciona
  async searchProducts(query: any) {
    // Construimos dinámicamente los filtros
    const where: any = {};

    if (query.marca) {
      where.marca = { contains: query.marca, mode: 'insensitive' }; // Búsqueda insensible a mayúsculas
    }

    if (query.nombre) {
      where.nombre = { contains: query.nombre, mode: 'insensitive' };
    }

    if (query.precioMin && query.precioMax) {
      where.precio = {
        gte: parseFloat(query.precioMin),
        lte: parseFloat(query.precioMax),
      };
    } else if (query.precioMin) {
      where.precio = { gte: parseFloat(query.precioMin) };
    } else if (query.precioMax) {
      where.precio = { lte: parseFloat(query.precioMax) };
    }

    if (query.available !== undefined) {
      where.available = query.available === true;
    }

    // Ejecutamos la consulta con Prisma
    return prisma.product.findMany({
      where,
    });
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
