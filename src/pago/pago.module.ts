import { Module } from '@nestjs/common';
import { PagoController } from './pago.controller';

@Module({
  controllers: [PagoController],
  providers: [],
  imports: [],
})
export class PagoModule {}
