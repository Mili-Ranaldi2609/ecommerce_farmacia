import { Module } from '@nestjs/common';
import { PagoController } from './pago.controller';
import { PagoService } from './pago.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [PagoController],
  providers: [PagoService],
  imports: [AuthModule],
})
export class PagoModule {}
