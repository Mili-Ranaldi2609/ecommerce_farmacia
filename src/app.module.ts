import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CategoriaModule } from './categoria/categoria.module';
import { ComentarioModule } from './comentario/comentario.module';
import { DescripcionModule } from './descripcion/descripcion.module';
import { FavoritoModule } from './favorito/favorito.module';
import { ImagenModule } from './imagen/imagen.module';
import { PagoModule } from './pago/pago.module';
import { PedidoModule } from './pedido/pedido.module';
import { PrecioFullsaludModule } from './precio_fullsalud/precio_fullsalud.module';
import { PresupuestoModule } from './presupuesto/presupuesto.module';
import { ProductsModule } from './products/products.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { RecetaModule } from './receta/receta.module';
import { SolicitudPresupuestoModule } from './solicitud-presupuesto/solicitud-presupuesto.module';
import { TipoProductoModule } from './tipo_producto/tipo_producto.module';
import { TiposUsoModule } from './tipos-uso/tipos-uso.module';

@Module({
  imports: [
    AuthModule,
    CategoriaModule,
    ComentarioModule,
    DescripcionModule,
    FavoritoModule,
    ImagenModule,
    PagoModule,
    PedidoModule,
    PrecioFullsaludModule,
    PresupuestoModule,
    ProductsModule,
    ProveedoresModule,
    RecetaModule,
    SolicitudPresupuestoModule,
    TipoProductoModule,
    TiposUsoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
