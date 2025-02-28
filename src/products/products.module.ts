import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';


@Module({
  controllers: [ProductsController],
  providers: [],
  imports: []
})
export class ProductsModule {
  constructor(){}
}
