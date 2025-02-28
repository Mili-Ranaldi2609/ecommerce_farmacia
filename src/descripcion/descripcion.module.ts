import { Module } from '@nestjs/common';
import { DescripcionController } from './descripcion.controller';

@Module({
  controllers: [DescripcionController],
  providers: [],
  imports: []
})
export class DescripcionModule {}
