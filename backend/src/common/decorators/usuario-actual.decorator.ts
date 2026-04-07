import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Usuario } from '../../modules/usuarios/entities/usuario.entity';

export const UsuarioActual = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Usuario => {
    const request = ctx.switchToHttp().getRequest<{ user: Usuario }>();
    return request.user;
  },
);
