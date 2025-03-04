import { Module } from '@nestjs/common';
import { FavoritoController } from './favorito.controller';
import { FavoritosService } from './favoritos.service';
import { ProductsService } from 'src/products/products.service';
import { AuthModule } from 'src/auth/auth.module';


@Module({
  controllers: [FavoritoController],
  providers: [FavoritosService, ProductsService],
  imports: [AuthModule],
})
export class FavoritoModule {
  constructor() {}
}
