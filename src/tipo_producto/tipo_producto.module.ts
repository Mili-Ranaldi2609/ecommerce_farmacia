import { Module } from '@nestjs/common';
import { TipoProductoController } from './tipo_producto.controller';

@Module({
  controllers: [TipoProductoController],
  providers: [],
  imports:[]
})
export class TipoProductoModule {
  constructor(){}
}
