import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    @Inject() private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext) {

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException( 'Token not found' );
    }
    try {

      const result = await this.authService.verifyToken(token);
      if (!result) {
        throw new UnauthorizedException();
      }
      const { user, token: newToken } = result;

      request['user'] = user;

      request['token'] = newToken;

    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
