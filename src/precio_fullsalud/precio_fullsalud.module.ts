import { Module } from '@nestjs/common';
import { PrecioFullsaludController } from './precio_fullsalud.controller';


@Module({
  controllers: [PrecioFullsaludController],
  providers: [],
  imports: []
})
export class PrecioFullsaludModule {}
