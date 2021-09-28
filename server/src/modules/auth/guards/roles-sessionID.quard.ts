import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/custom-decorators/roles-auth';
// import { Request } from 'express';

@Injectable()
export class RoleSessionIdGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    try {
      const req: any = context.switchToHttp().getRequest();
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (!requiredRoles) {
        return false;
      }
      if (req.session && req.session.roles.some(role => requiredRoles.includes(role.value))) {
        console.log(req.session.roles);
        return true;
      }
    } catch (error) {
      console.log(error.message);
      throw new UnauthorizedException({ message: 'Пользователь не авторизован' });
    }
  }
}
