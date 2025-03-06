import { Module } from '@nestjs/common';
import { PedidoController } from './pedido.controller';
import { PedidoService } from './pedido.service';
import { ProductsService } from 'src/products/products.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [PedidoController],
  providers: [PedidoService, ProductsService],
  imports: [AuthModule],
})
export class PedidoModule {}
