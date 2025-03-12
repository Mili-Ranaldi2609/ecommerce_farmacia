import { Module } from '@nestjs/common';
import { FavoritoController } from './favorito.controller';
import { FavoritosService } from './favoritos.service';
import { ProductsService } from '../products/products.service';
import { AuthModule } from '../auth/auth.module';


@Module({
  controllers: [FavoritoController],
  providers: [FavoritosService, ProductsService],
  imports: [AuthModule],
})
export class FavoritoModule {
  constructor() {}
}
