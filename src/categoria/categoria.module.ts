import { Module } from '@nestjs/common';
import { CategoriaController } from './categoria.controller';
import { CategoriaService } from './categoria.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [CategoriaController],
  providers: [CategoriaService],
  imports:[AuthModule]
})
export class CategoriaModule {
  constructor(){}
}
