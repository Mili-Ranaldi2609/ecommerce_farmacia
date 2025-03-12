import { Module } from '@nestjs/common';
import { RecetaController } from './receta.controller';
import { RecetaService } from './receta.service';
import { ProductsService } from '../products/products.service';
import { FavoritosService } from '../favorito/favoritos.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [RecetaController],
  providers: [RecetaService, ProductsService, FavoritosService],
  imports: [AuthModule],
})
export class RecetaModule {}
