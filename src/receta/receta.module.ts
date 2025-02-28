import { Module } from '@nestjs/common';
import { RecetaController } from './receta.controller';

@Module({
  controllers: [RecetaController],
  providers: [],
  imports: [],
})
export class RecetaModule {}
