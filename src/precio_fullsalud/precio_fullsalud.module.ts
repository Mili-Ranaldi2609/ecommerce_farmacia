import { Module } from '@nestjs/common';
import { PrecioFullsaludController } from './precio_fullsalud.controller';
import { PrecioFullSaludService } from './precio-full-salud.service';
import { AuthModule } from '../auth/auth.module';


@Module({
  controllers: [PrecioFullsaludController],
  providers: [PrecioFullSaludService],
  imports: [AuthModule]
})
export class PrecioFullsaludModule {}
