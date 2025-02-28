import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    // Limpia el campo `descripcion` si existe
    if (request.body.descripcion.descripcion) {
      request.body.descripcion.descripcion = request.body.descripcion.descripcion
        .replace(/[\r\n]+/g, '\\n') // Escapa saltos de línea
        .replace(/"/g, '\\"'); // Escapa comillas dobles
    }
    return next.handle();
  }
}
