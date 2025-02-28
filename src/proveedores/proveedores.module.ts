import { Module } from '@nestjs/common';
import { ProveedoresController } from './proveedores.controller';

@Module({
  controllers: [ProveedoresController],
  providers: [],
  imports: [],
})
export class ProveedoresModule {}
