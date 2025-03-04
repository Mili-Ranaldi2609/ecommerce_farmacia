import { Module } from '@nestjs/common';
import { ImagenController } from './imagen.controller';
import { ImagenService } from './imagen.service';
import { ProductsService } from 'src/products/products.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ImagenController],
  providers: [ImagenService, ProductsService],
  imports: [AuthModule],
})
export class ImagenModule {}
