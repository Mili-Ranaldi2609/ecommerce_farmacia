import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductoDto } from './dto/updateProductoDto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { connect } from 'http2';
import { ProductoConCategoriasDto } from './dto/producto-categoria';
import { UpdateProductoDataDto } from './dto/updateProductoData,dto';
import { TiposUso } from '../tipos-uso/entities/tipos-uso.entity';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }

  async create(data: CreateProductDto) {
    // const { nombre, precio, marca, stock, categoriaIds, tipoProductoId, descripcionId } = data
    const {
      categoriaIds,
      tipoProductoId,
      descripcion,
      tiposDeUso,
      proveedorId,
      //caracteristicas,
      ...productData
    } = data;

    const array = data.categoriaIds || [];
    const lengthArray = array.length;

    //TODO check exits tipo producto y categorias. Y en el update
    //TODO Tambien 1ro crear producto luego crear descripcion y tipo de uso
    //la forma actual de creacion de producto, cea descripcion y tiposDeUso con el mismo id
    //no deberia ser asi

    const createdDescripcion = await this.descripcion.create({
      data: {
        descripcion: descripcion.descripcion,
        caracteristicas: descripcion.caracteristicas,
      },
    });

    // Crear el tipo de uso
    const createdTipoUso = await this.tipoUso.create({
      data: {
        descripcion: tiposDeUso.descripcion,
        tiposDeUso: tiposDeUso.tiposDeUso,
      },
    });

    const producto = await this.product.create({
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
        // ...(proveedorId && {
        //   proveedor: {
        //     connect: {
        //       id: proveedorId, // Aquí debes pasar el ID del proveedor.
        //     },
        // }})
       // proveedor: proveedorId ? { connect: { id: proveedorId } } : undefined, // Solo si existe proveedorId
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

  // async findAll(paginationDto: paginationDto) {
  //   const { page, limit } = paginationDto

  //   const totalPages = await this.product.count({ where: { available: true } })
  //   const lastPage = Math.ceil(totalPages / limit)

  //   return {
  //     data: await this.product.findMany({
  //       skip: (page - 1) * limit,
  //       take: limit,
  //       where: { available: true },
  //       //probar si funciona con el include aca
  //       include: {
  //         categorias:
  //         {
  //           include:
  //           {
  //             categoria:
  //             {
  //               select: {
  //                 id: true,
  //                 nombreCategoria: true
  //               }
  //             }
  //           }
  //         },
  //         tipoProducto: {
  //           select: {
  //             id: true,
  //             nombreTipo: true, // Solo seleccionamos id y nombreTipo
  //           },
  //         },
  //         descuento: {
  //           select: {
  //             id: true,
  //             precioDescuento: true
  //           },
  //         },
  //         descripcion:{
  //           where: {
  //             available: true
  //           },
  //           select:{
  //             id: true,
  //             descripcion: true,
  //             caracteristicas: true
  //           }
  //         },
  //         tiposDeUso:{
  //           where: {
  //             available: true
  //           },
  //           select:{
  //             id: true,
  //             descripcion: true,
  //             tiposDeUso: true
  //           }
  //         }
  //       },
  //     },
  //     ),
  //     meta: {
  //       total: totalPages,
  //       page: page,
  //       lastPage: lastPage
  //     }
  //   }
  // }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10} = paginationDto;

    const totalPages = await this.product.count({ where: { available: true } });
    const lastPage = Math.ceil(totalPages / limit);

    // Obtén los datos del producto
    const products = await this.product.findMany({
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

  // async findOne(id: number) {
  //   const product = await this.product.findFirst({
  //     where: { id, available: true},
  //     include: {
  //       categorias:
  //       {
  //         include:
  //         {
  //           categoria:
  //           {
  //             select: {
  //               id: true,
  //               nombreCategoria: true
  //             }
  //           }
  //         }
  //       },
  //       tipoProducto: {
  //         select: {
  //           id: true,
  //           nombreTipo: true, // Solo seleccionamos id y nombreTipo
  //         },
  //       },
  //       descuento: {
  //         where: { available: true },
  //         select: {
  //           id: true,
  //           precioDescuento: true
  //         },
  //         take: 1,
  //       },
  //       descripcion:{
  //         where: {
  //           available: true
  //         },
  //         select:{
  //           id: true,
  //           descripcion: true,
  //           caracteristicas: true
  //         }
  //       },
  //       tiposDeUso:{
  //         where: {
  //           available: true
  //         },
  //         select:{
  //           id: true,
  //           descripcion: true,
  //           tiposDeUso: true
  //         }
  //       }
  //     },
  //   });

  //   if (!product) {
  //     //throw new RpcException(`Product with id ${id} was not found`);
  //     throw new RpcException({
  //       message: `Product with id ${id} was not found!!`,
  //       status: HttpStatus.BAD_REQUEST
  //     })
  //   }
  //   return product
  // }

  async findOne(id: number) {
    const product = await this.product.findFirst({
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
    const product = await this.product.findFirst({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product you want was not found');
    }
    return product;
  }

  //TODO complete update whit categories, relacion producto categorias gpt
  // async updatev1(id: number, updateProductDto: UpdateProductDto) {
  //   // const {id: _, ...data} = updateProductDto;
  //   // const productToUpdate = await this.findOne(id);

  //   // return this.product.update({
  //   //   where:{ id},
  //   //   data: data,

  //   //})

  //   const { categoriaIds, tipoProductoId,...data } = updateProductDto;

  //   const productToUpdate = await this.findOne(id)
  //   if (!productToUpdate) {
  //     throw new NotFoundException('El producto que intentas actualizar no fue encontrado');
  //   }

  //   return this.product.update({
  //     where: { id }, // Producto a actualizar
  //     data: {
  //       ...data, // Otros campos del producto

  //       // Manejamos las categorías a través de la tabla intermedia
  //       ...(categoriaIds && {
  //         categorias: {
  //           // Eliminar relaciones anteriores en la tabla intermedia
  //           deleteMany: {},

  //           // Crear nuevas relaciones
  //           create: categoriaIds?.map(categoriaId => ({
  //             categoria: {
  //               connect: { id: categoriaId }
  //             },
  //           })),
  //         }
  //       }),
  //       ...(tipoProductoId && {
  //         tipoProducto: {
  //           connect: {id: tipoProductoId}
  //         }
  //       }),
  //     },
  //   });

  // }

  //v2

  async update(id: number, updateProductDto: UpdateProductoDataDto) {
    // Desestructuramos el DTO para obtener las categorías (si existen) y los demás datos del producto
    const { categoriasIds, tipoProductoId, ...data } = updateProductDto;
    // Primero buscamos el producto a actualizar
    const productToUpdate = await this.findOne(id);
    if (!productToUpdate) {
    }

    //TODO check if exists tipoProducto y categoria to update producto
    // Realizamos la actualización del producto
    return this.product.update({
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

  // async updateProduct(id: number, updateProductoDto: UpdateProductoDto) {
  //   const { categoriasIds, tipoProductoId, ...data } = updateProductoDto;

  //   // Elimina `id` si existe en `data`
  //   if ('id' in data) {
  //     delete (data as any).id;
  //   }

  //   // Actualización del producto
  //   const updatedProduct = await this.product.update({
  //     where: { id },
  //     data: {
  //       ...data,
  //       // Si 'tipoProductoId' es proporcionado, actualizamos la relación
  //       tipoProducto: tipoProductoId ? { connect: { id: tipoProductoId } } : undefined,

  //     },
  //   });

  //   // Actualización de las categorías asociadas
  //   //TODO verificar esta actualizacion
  //   if (categoriasIds) {
  //     // Primero eliminamos las relaciones previas de ProductoCategoria
  //     const deleted = await this.productoCategoria.deleteMany({
  //       where: { productId: id },
  //     });

  //     if(deleted){
  //       // Luego, agregamos las nuevas relaciones
  //       await this.productoCategoria.createMany({
  //         data: categoriasIds.map((categoriaId) => ({
  //           productId: id,
  //           categoriaId,
  //         })),
  //       });

  //     }
  //   }

  //   return updatedProduct;
  // }

  //habilitar producto

  async updateAvailable(id: number) {
    const productToUpdate = await this.exists(id);
    if (!productToUpdate) {
      throw new NotFoundException('Product you want to update was not found');
    }

    return this.product.update({
      where: { id },
      data: {
        available: true,
      },
    });
  }

  //eliminacion suave
  async remove(id: number) {
    await this.findOne(id);
    const product = await this.product.update({
      where: { id },
      data: {
        available: false,
      },
    });

    return product;
  }

  // //get produtcs by category
  // async getProductByCategory(categoriaId: number, paginationDto: paginationDto){
  //  //paginacion
  //   const { page, limit } = paginationDto

  //   const totalPages = await this.product.count({ where: {categorias: {
  //     some: {
  //       categoriaId: categoriaId
  //     }},
  //     available: true
  //   } })
  //   const lastPage = Math.ceil(totalPages / limit)

  //   const products = await this.product.findMany({
  //     skip: (page - 1) * limit,
  //     take: limit,
  //     where: {
  //       categorias: {
  //         some: {
  //           categoriaId: categoriaId
  //         }
  //       }
  //     },
  //     include: {
  //       categorias: {
  //         include: {
  //           categoria: true
  //         },
  //       },
  //       tipoProducto: {
  //         select: {
  //           id: true,
  //           nombreTipo: true, // Solo seleccionamos id y nombreTipo
  //         },
  //       },
  //       descuento: {
  //         where: {
  //           available: true
  //         },
  //         select: {
  //           id: true,
  //           precioDescuento: true
  //         },
  //       },
  //       descripcion:{
  //         where: {
  //           available: true
  //         },
  //         select:{
  //           id: true,
  //           descripcion: true,
  //           caracteristicas: true
  //         }
  //       },
  //       tiposDeUso:{
  //         where: {
  //           available: true
  //         },
  //         select:{
  //           id: true,
  //           descripcion: true,
  //           tiposDeUso: true
  //         }
  //       }
  //     }
  //   })

  //   // Mapear los resultados al DTO
  //   const productsDto = products.map((producto) => {
  //     const descuento = producto.descuento[0]; // Tomar el primer descuento disponible, si existe
  //     return {
  //       id: producto.id,
  //       nombre: producto.nombre,
  //       precio: producto.precio,
  //       marca: producto.marca,
  //       stock: producto.stock,
  //       available: producto.available,
  //       categorias: producto.categorias.map((cat) => ({
  //         id: cat.categoria.id,
  //         nombreCategoria: cat.categoria.nombreCategoria
  //       })),
  //       descuento: descuento ? {
  //         id: descuento.id,
  //         precioDescuento: descuento.precioDescuento
  //       } : null,
  //       descripcion: producto.descripcion ? {
  //         id: producto.descripcion.id,
  //         descripcion: producto.descripcion.descripcion,
  //         caracteristicas: producto.descripcion.caracteristicas
  //       }: null,
  //       tiposDeUso: producto.tiposDeUso ? {
  //         id: producto.tiposDeUso.id,
  //         descripcion: producto.tiposDeUso.descripcion,
  //         tiposDeUso: producto.tiposDeUso.tiposDeUso
  //       }: null,
  //     };
  //   });

  //   return {
  //     products: productsDto,
  //     meta: {
  //       total: totalPages,
  //       page: page,
  //       lastPage: lastPage
  //     }
  //   };
  // }

  // Get products by category with pagination
  async getProductByCategory(
    categoriaId: number,
    paginationDto: PaginationDto,
  ) {
    const { page = 1, limit = 10 } = paginationDto;

    // Total de productos disponibles que pertenecen a la categoría
    const totalPages = await this.product.count({
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
    const products = await this.product.findMany({
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

  //   async buscarProductosPorNombre(nombre: string, paginationDto: paginationDto) {

  //     //pagination
  //     const { page, limit } = paginationDto
  //     const totalPages = await this.product.count({ where: { nombre: {
  //       contains: nombre,   // Búsqueda parcial (case-insensitive)
  //       mode: 'insensitive' // Opción para ignorar mayúsculas y minúsculas
  //     },available: true } })

  //     const lastPage = Math.ceil(totalPages / limit)

  //     return{ productos: await this.product.findMany({

  //       skip: (page - 1) * limit,
  //       take: limit,
  //       where: {
  //         nombre: {
  //           contains: nombre,   // Búsqueda parcial (case-insensitive)
  //           mode: 'insensitive' // Opción para ignorar mayúsculas y minúsculas
  //         },
  //       },
  //       include: {
  //         categorias:
  //         {
  //           include:
  //           {
  //             categoria:
  //             {
  //               select: {
  //                 id: true,
  //                 nombreCategoria: true
  //               }
  //             }
  //           }
  //         },
  //         tipoProducto: {
  //           select: {
  //             id: true,
  //             nombreTipo: true, // Solo seleccionamos id y nombreTipo
  //           },
  //         },
  //         descuento: {
  //           where: {
  //             available: true
  //           },
  //           select: {
  //             id: true,
  //             precioDescuento: true
  //           },
  //         },
  //         descripcion:{
  //           where: {
  //             available: true
  //           },
  //           select:{
  //             descripcion: true,
  //             caracteristicas: true
  //           }
  //         },
  //         tiposDeUso:{
  //           where: {
  //             available: true
  //           },
  //           select:{
  //             id: true,
  //             descripcion: true,
  //             tiposDeUso: true
  //           }
  //         }
  //       },
  //     }),
  //     meta: {
  //       total: totalPages,
  //       page: page,
  //       lastPage: lastPage
  //     }
  //     // Mapear los resultados al DTO
  //     // return productos.map((producto) => {
  //     //   return {
  //     //     id: producto.id,
  //     //     nombre: producto.nombre,
  //     //     precio: producto.precio,
  //     //     marca: producto.marca,
  //     //     descripcion: producto.descripcion,
  //     //     stock: producto.stock,
  //     //     available: producto.available,
  //     //     categorias: producto.categorias.map((cat) => ({
  //     //       id: cat.categoria.id,
  //     //       nombreCategoria: cat.categoria.nombreCategoria,
  //     //     })),
  //     //   };
  //     // });

  //   }
  // }

  async buscarProductosPorNombre(nombre: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    // Total de productos que coinciden con el nombre y están disponibles
    const totalPages = await this.product.count({
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
    const productos = await this.product.findMany({
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

  // async getProductsByTipoProducto(tipoProductoId: number, paginationDto: paginationDto) {
  //   //pagination
  //   const { page, limit } = paginationDto
  //   const totalPages = await this.product.count({ where: { tipoProductoId, available: true } })
  //   const lastPage = Math.ceil(totalPages / limit)

  //   return {productos: await this.product.findMany({
  //     skip: (page - 1) * limit,
  //     take: limit,

  //     where: {
  //       tipoProductoId,
  //       available: true,
  //     },
  //     include: {
  //       categorias: {
  //         select: {
  //           categoria: { // Aquí incluimos solo los campos id y nombre de la categoría
  //             select: {
  //               id: true,
  //               nombreCategoria: true,
  //             },
  //           },
  //         },
  //       },
  //       tipoProducto: { // Incluimos el tipo de producto con solo los campos id y nombre
  //         select: {
  //           id: true,
  //           nombreTipo: true,
  //         },
  //       },
  //       descuento: {
  //         where: { available: true }, // Filtramos solo el descuento activo
  //         select: {
  //           precioDescuento: true,
  //         },
  //       },
  //       descripcion:{
  //         where: {
  //           available: true
  //         },
  //         select:{
  //           descripcion: true,
  //           caracteristicas: true
  //         }
  //       }
  //     },

  //   }),
  //     meta: {
  //       total: totalPages,
  //       page: page,
  //       lastPage: lastPage
  //     }
  //   }
  // }

  //Buscar por query verificar funcionamiento
  //FALTA hacer paginacion

  async getProductsByTipoProducto(
    tipoProductoId: number,
    paginationDto: PaginationDto,
  ) {
    const { page = 1, limit = 10 } = paginationDto;

    // Total de productos que coinciden con el tipo de producto y están disponibles
    const totalPages = await this.product.count({
      where: {
        tipoProductoId,
        available: true, // Solo productos disponibles
      },
    });

    const lastPage = Math.ceil(totalPages / limit); // Calcula la última página

    // Obtiene los productos con las relaciones y paginación
    const productos = await this.product.findMany({
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
    return this.product.findMany({
      where,
    });
  }

  async validateProducts(ids: number[]) {
    ids = Array.from(new Set(ids));

    const products = await this.product.findMany({
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
