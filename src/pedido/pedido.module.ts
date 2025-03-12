import { Module } from '@nestjs/common';
import { PedidoController } from './pedido.controller';
import { PedidoService } from './pedido.service';
import { ProductsService } from '../products/products.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [PedidoController],
  providers: [PedidoService, ProductsService],
  imports: [AuthModule],
})
export class PedidoModule {}
