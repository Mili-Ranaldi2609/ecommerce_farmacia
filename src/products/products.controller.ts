import { Body, Controller, Delete, Get, Param, Patch, Post, Query, ParseIntPipe, UseInterceptors, UseGuards, Inject } from '@nestjs/common';
import { PaginationDto } from '../common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductDto } from './dto/search-product.dto';
import { SanitizeInterceptor } from '../common/sanitize.interceptor';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';

@Controller('products')
@ApiTags('Productos')
export class ProductsController {
  constructor(@Inject() private readonly productService: ProductsService) {}

  @UseGuards(AuthGuard)
  @Post('searchProductsQuery')
  @ApiBearerAuth('bearerAuth')
  async getProductsQuery(@Body() query: SearchProductDto){
    return this.productService.searchProducts(query);
  }

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth('bearerAuth')
  @UseInterceptors(SanitizeInterceptor)
  createProduct(@Body() createProductDto: CreateProductDto){
    return this.productService.create(createProductDto);
  }

  @Get()
  findAllProduct( @Query() paginationDto: PaginationDto){
    return this.productService.findAll(paginationDto);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiBearerAuth('bearerAuth')
  async findOne(@Param('id', ParseIntPipe) id: number){
    return this.productService.findOne(id);
  }
  
  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiBearerAuth('bearerAuth')
  async deleteProduct(@Param('id', ParseIntPipe) id: number){
    return this.productService.remove(id);
  } 

  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiBearerAuth('bearerAuth')
  @UseInterceptors(SanitizeInterceptor)
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto
  ){
    return this.productService.update(id, updateProductDto);
  }

  @UseGuards(AuthGuard)
  @Patch('/available/:id')
  @ApiBearerAuth('bearerAuth')
  async makeAvailableProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto
  ){
    return this.productService.updateAvailable(id);
  }

  @UseGuards(AuthGuard)
  @Get('productByCategory/:id')
  @ApiBearerAuth('bearerAuth')
  async getProductByCategory(@Query() paginationDto: PaginationDto, @Param('id', ParseIntPipe) id: number){
    return this.productService.getProductByCategory(id, paginationDto);
  }

  @UseGuards(AuthGuard)
  @Get('searchProductByName/:nombre')
  @ApiBearerAuth('bearerAuth')
  async getProductByName(@Query() paginationDto:PaginationDto,@Param('nombre') nombre: string){
    return this.productService.buscarProductosPorNombre(nombre, paginationDto);
  }

  @UseGuards(AuthGuard)
  @Get('productByTipoProd/:id')
  @ApiBearerAuth('bearerAuth')
  async getProductByTipo(@Query() paginationDto: PaginationDto, @Param('id', ParseIntPipe) id: number) {
    return this.productService.getProductsByTipoProducto(id, paginationDto);
  }

  //ejemplo: 
  //GET localhost:3000/products/searchQuery?marca=pyg&nombre=alcohol
  //GET localhost:3000/products/searchQuery?precioMin=10&precioMax=100
  // @Get('searchProductsQuery')
  // async getProductByQuery(@Query() query: SearchProductDto){
  //   try {
  //     console.log('query: ', query)
  //     const products = await firstValueFrom(
  //     this.productsClient.send({ cmd: 'search_product_query' }, { query } )
  //     );
  //     return products;

  //   } catch (error) {
  //     throw new RpcException(error);
  //   }
  // }

  
}
