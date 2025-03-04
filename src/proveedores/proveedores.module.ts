import { Module } from '@nestjs/common';
import { ProveedoresController } from './proveedores.controller';
import { ProveedoresService } from './proveedores.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ProveedoresController],
  providers: [ProveedoresService],
  imports: [AuthModule],
})
export class ProveedoresModule {}
