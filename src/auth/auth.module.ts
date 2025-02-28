import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';


@Module({
  controllers: [AuthController],
  providers: [],
  imports:[]
})
export class AuthModule {
  constructor(){}
}
