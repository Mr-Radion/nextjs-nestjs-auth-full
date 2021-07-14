import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { AuthService } from './auth.service';

@Injectable()
export class JwtAutGuard implements CanActivate {
  constructor(private jwtService: JwtService, private authService: AuthService) {}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const authHeader = req.headers.authorization;
      const bearer = authHeader.split(' ')[0];
      var token = authHeader.split(' ')[1];
      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException({ message: 'Пользователь не авторизован' });
      }
      const user = this.jwtService.verify(token);
      req.user = user;
      return true;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        // this.authService.removeToken(token);
        throw new HttpException(`Срок действия токена истек`, HttpStatus.BAD_REQUEST);
      }
      if (error instanceof jwt.JsonWebTokenError)
        throw new HttpException(`Неверный формат рефреш токена`, HttpStatus.BAD_REQUEST);
      throw new UnauthorizedException({ message: 'Пользователь не авторизован' });
    }
  }
}
