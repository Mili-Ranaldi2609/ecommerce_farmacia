import { Module } from '@nestjs/common';
import { DescripcionController } from './descripcion.controller';
import { DescripcionService } from './descripcion.service';
import { ProductsService } from 'src/products/products.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [DescripcionController],
  providers: [DescripcionService, ProductsService],
  imports: [AuthModule]
})
export class DescripcionModule {}
