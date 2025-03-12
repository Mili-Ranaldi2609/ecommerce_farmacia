import { Module } from '@nestjs/common';
import { ComentarioController } from './comentario.controller';
import { ComentarioService } from './comentario.service';
import { FavoritosService } from '../favorito/favoritos.service';
import { ProductsService } from '../products/products.service';
import { AuthModule } from '../auth/auth.module';


@Module({
  controllers: [ComentarioController],
  providers: [ComentarioService, FavoritosService, ProductsService],
  imports:[AuthModule]
})
export class ComentarioModule {
  constructor() {}
}
