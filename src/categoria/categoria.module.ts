import { Module } from '@nestjs/common';
import { CategoriaController } from './categoria.controller';

@Module({
  controllers: [CategoriaController],
  providers: [],
  imports:[]
})
export class CategoriaModule {
  constructor(){}
}
