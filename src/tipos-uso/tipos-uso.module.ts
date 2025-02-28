import { Module } from '@nestjs/common';
import { TiposUsoController } from './tipos-uso.controller';

@Module({
  controllers: [TiposUsoController],
  providers: [],
  imports: []
})
export class TiposUsoModule {}
