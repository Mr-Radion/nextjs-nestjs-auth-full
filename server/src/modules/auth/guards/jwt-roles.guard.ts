import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/custom-decorators/roles-auth';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      console.log('requiredRoles', requiredRoles)
      if (!requiredRoles.length) {
        // so that the check is not done once again when the default is already USER and we have not passed USER to the decorator and want to leave him
        return true;
        // return false; // to explicitly specify all decorators, including the default one for checking the USER role
      }
      const req = context.switchToHttp().getRequest();
      const authHeader = req.headers.authorization;
      // const bearer = authHeader.split(' ')[0];
      const accessToken = authHeader.split(' ')[1];
      const refreshToken = req.cookies?.['token'];

      if (!accessToken || !refreshToken) {
        throw new UnauthorizedException({ message: 'Пользователь не авторизован' });
      }

      const hasAccessTokenUser = this.jwtService.verify(accessToken);
      const hasRefreshTokenUser = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      if (hasAccessTokenUser.email !== hasRefreshTokenUser.email) {
        throw new UnauthorizedException({ message: 'Ваши токены входа не совпадают' });
      }

      req.user = hasAccessTokenUser || hasRefreshTokenUser;
      console.log('roles', hasAccessTokenUser.roles);
      return hasAccessTokenUser.roles.some(role => requiredRoles.includes(role.value));
    } catch (e) {
      console.log(e);
      throw new HttpException('Нет доступа', HttpStatus.FORBIDDEN);
    }
  }
}
