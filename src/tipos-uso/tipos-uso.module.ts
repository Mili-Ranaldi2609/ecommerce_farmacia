import { Module } from '@nestjs/common';
import { TiposUsoController } from './tipos-uso.controller';
import { TiposUsoService } from './tipos-uso.service';
import { ProductsService } from 'src/products/products.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [TiposUsoController],
  providers: [TiposUsoService, ProductsService],
  imports: [AuthModule]
})
export class TiposUsoModule {}
