import { Body, Controller, Delete, Get, Param, Patch, Post, Query, ParseIntPipe, UseInterceptors, UseGuards, Inject } from '@nestjs/common';
import { PaginationDto } from '../common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductDto } from './dto/search-product.dto';
import { SanitizeInterceptor } from '../common/sanitize.interceptor';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';

@Controller('products')
@ApiTags('Productos')
export class ProductsController {
  constructor(@Inject() private readonly productService: ProductsService) {}

  @UseGuards(AuthGuard)
  @Post('searchProductsQuery')
  @ApiBearerAuth('bearerAuth')
  @ApiBody({
    description: 'Search products by query',
    type: SearchProductDto,
    examples: {
      example1: {
        summary: 'Example request',
        value: {
          nombre: 'Alcohol',
          marca: 'BrandX',
          precioMin: 10,
          precioMax: 100,
        },
      },
    },
  })
  async getProductsQuery(@Body() query: SearchProductDto) {
    return this.productService.searchProducts(query);
  }

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth('bearerAuth')
  @UseInterceptors(SanitizeInterceptor)
  @ApiBody({
    description: 'Create a new product',
    type: CreateProductDto,
    examples: {
      example1: {
        summary: 'Example request',
        value: {
          nombre: 'Alcohol Gel',
          precio: 50.25,
          marca: 'BrandX',
          stock: 100,
          categoriaIds: [1, 2],
          tipoProductoId: 1,
          descripcion: {
            descripcion: 'A high-quality alcohol gel.',
            caracteristicas: ['Antibacterial', 'Quick-drying', 'Non-sticky'],
          },
          tiposDeUso: {
            nombre: 'Personal Care',
            descripcion: 'For personal hygiene and cleanliness.',
          },
          proveedorId: 3,
        },
      },
    },
  })
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  @ApiBearerAuth('bearerAuth')
  findAllProduct(@Query() paginationDto: PaginationDto) {
    return this.productService.findAll(paginationDto);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiBearerAuth('bearerAuth')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiBearerAuth('bearerAuth')
  async deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiBearerAuth('bearerAuth')
  @UseInterceptors(SanitizeInterceptor)
  @ApiBody({
    description: 'Update a product',
    type: UpdateProductDto,
    examples: {
      example1: {
        summary: 'Example request',
        value: {
          nombre: 'Updated Alcohol Gel',
          precio: 60.00,
          stock: 120,
          descripcion: 'An updated description for alcohol gel.',
        },
      },
    },
  })
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(id, updateProductDto);
  }

  @UseGuards(AuthGuard)
  @Patch('/available/:id')
  @ApiBearerAuth('bearerAuth')
  async makeAvailableProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productService.updateAvailable(id);
  }

  @UseGuards(AuthGuard)
  @Get('productByCategory/:id')
  @ApiBearerAuth('bearerAuth')
  async getProductByCategory(@Query() paginationDto: PaginationDto, @Param('id', ParseIntPipe) id: number) {
    return this.productService.getProductByCategory(id, paginationDto);
  }

  @UseGuards(AuthGuard)
  @Get('searchProductByName/:nombre')
  @ApiBearerAuth('bearerAuth')
  async getProductByName(@Query() paginationDto: PaginationDto, @Param('nombre') nombre: string) {
    return this.productService.buscarProductosPorNombre(nombre, paginationDto);
  }

  @UseGuards(AuthGuard)
  @Get('productByTipoProd/:id')
  @ApiBearerAuth('bearerAuth')
  async getProductByTipo(@Query() paginationDto: PaginationDto, @Param('id', ParseIntPipe) id: number) {
    return this.productService.getProductsByTipoProducto(id, paginationDto);
  }
}
