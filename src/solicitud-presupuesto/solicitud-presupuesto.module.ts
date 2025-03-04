import { Module } from '@nestjs/common';
import { SolicitudPresupuestoController } from './solicitud-presupuesto.controller';
import { SolicitudPresupuestoService } from './solicitud-presupuesto.service';
import { ProductsService } from 'src/products/products.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [SolicitudPresupuestoController],
  providers: [SolicitudPresupuestoService, ProductsService],
  imports:[AuthModule]
})
export class SolicitudPresupuestoModule {}
