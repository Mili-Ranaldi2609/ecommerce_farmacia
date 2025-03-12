import { Module } from '@nestjs/common';
import { PresupuestoController } from './presupuesto.controller';
import { PresupuestoService } from './presupuesto.service';
import { ProveedoresService } from '../proveedores/proveedores.service';
import { ProductsService } from '../products/products.service';
import { SolicitudPresupuestoService } from '../solicitud-presupuesto/solicitud-presupuesto.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [PresupuestoController],
  providers: [PresupuestoService, ProveedoresService, ProductsService, SolicitudPresupuestoService],
  imports:[AuthModule]
})
export class PresupuestoModule {}
