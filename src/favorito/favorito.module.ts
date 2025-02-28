import { Module } from '@nestjs/common';
import { FavoritoController } from './favorito.controller';


@Module({
  controllers: [FavoritoController],
  providers: [],
  imports: [],
})
export class FavoritoModule {
  constructor() {}
}
