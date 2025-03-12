import { Module } from '@nestjs/common';
import { TipoProductoController } from './tipo_producto.controller';
import { TipoProductoService } from './tipo-producto.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [TipoProductoController],
  providers: [TipoProductoService],
  imports:[AuthModule]
})
export class TipoProductoModule {
  constructor(){}
}
