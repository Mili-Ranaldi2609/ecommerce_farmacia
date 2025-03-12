import { Module } from '@nestjs/common';
import { PagoController } from './pago.controller';
import { PagoService } from './pago.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [PagoController],
  providers: [PagoService],
  imports: [AuthModule],
})
export class PagoModule {}
