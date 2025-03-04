import { Module } from '@nestjs/common';
import { ComentarioController } from './comentario.controller';
import { ComentarioService } from './comentario.service';
import { FavoritosService } from 'src/favorito/favoritos.service';
import { ProductsService } from 'src/products/products.service';
import { AuthModule } from 'src/auth/auth.module';


@Module({
  controllers: [ComentarioController],
  providers: [ComentarioService, FavoritosService, ProductsService],
  imports:[AuthModule]
})
export class ComentarioModule {
  constructor() {}
}
