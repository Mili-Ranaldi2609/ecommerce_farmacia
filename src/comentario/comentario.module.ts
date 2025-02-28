import { Module } from '@nestjs/common';
import { ComentarioController } from './comentario.controller';


@Module({
  controllers: [ComentarioController],
  providers: [],
  imports: [],
})
export class ComentarioModule {
  constructor() {}
}
