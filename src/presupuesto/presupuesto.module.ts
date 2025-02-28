import { Module } from '@nestjs/common';
import { PresupuestoController } from './presupuesto.controller';

@Module({
  controllers: [PresupuestoController],
  providers: [],
  imports:[]
})
export class PresupuestoModule {}
