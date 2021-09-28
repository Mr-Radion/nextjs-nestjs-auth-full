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
import { AuthService } from '../auth.service';
import { hasUserAgent } from 'src/utils/has-user-agent';

@Injectable()
export class JwtAutGuard implements CanActivate {
  constructor(private jwtService: JwtService, private authService: AuthService) {}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const authHeader = req.headers.authorization;
      const bearer = authHeader.split(' ')[0];
      var accessToken = authHeader.split(' ')[1];
      var refreshToken = req.cookies?.['token'];
      if (bearer !== 'Bearer' || !accessToken || !refreshToken) {
        throw new UnauthorizedException({ message: 'Пользователь не авторизован' });
      }
      const hasAccessTokenUser = this.jwtService.verify(accessToken);
      const hasRefreshTokenUser = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      if (hasAccessTokenUser.email !== hasRefreshTokenUser.email) {
        throw new UnauthorizedException({ message: 'Ваши токены входа не совпадают' });
      }
      req.user = hasAccessTokenUser;
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
