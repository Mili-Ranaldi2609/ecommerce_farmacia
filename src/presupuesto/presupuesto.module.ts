import { Module } from '@nestjs/common';
import { PresupuestoController } from './presupuesto.controller';
import { PresupuestoService } from './presupuesto.service';
import { ProveedoresService } from 'src/proveedores/proveedores.service';
import { ProductsService } from 'src/products/products.service';
import { SolicitudPresupuestoService } from 'src/solicitud-presupuesto/solicitud-presupuesto.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [PresupuestoController],
  providers: [PresupuestoService, ProveedoresService, ProductsService, SolicitudPresupuestoService],
  imports:[AuthModule]
})
export class PresupuestoModule {}
