import { Module } from '@nestjs/common';
import { DescripcionController } from './descripcion.controller';
import { DescripcionService } from './descripcion.service';
import { ProductsService } from '../products/products.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [DescripcionController],
  providers: [DescripcionService, ProductsService],
  imports: [AuthModule]
})
export class DescripcionModule {}
