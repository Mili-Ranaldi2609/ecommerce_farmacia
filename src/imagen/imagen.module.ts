import { Module } from '@nestjs/common';
import { ImagenController } from './imagen.controller';
import { ImagenService } from './imagen.service';
import { ProductsService } from '../products/products.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [ImagenController],
  providers: [ImagenService, ProductsService],
  imports: [AuthModule],
})
export class ImagenModule {}
