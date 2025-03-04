import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { envs } from '../config';


@Module({
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
  imports: [JwtModule.register({
    global: true,
    secret: envs.jwtSecret,
    signOptions: { expiresIn: '2h' },
    }),
  ]
})
export class AuthModule {
  constructor(){}
}
