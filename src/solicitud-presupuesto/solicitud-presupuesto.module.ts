import { Module } from '@nestjs/common';
import { SolicitudPresupuestoController } from './solicitud-presupuesto.controller';

@Module({
  controllers: [SolicitudPresupuestoController],
  providers: [],
  imports:[]
})
export class SolicitudPresupuestoModule {}
