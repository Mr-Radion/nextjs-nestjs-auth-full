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
// import { hasUserAgent } from 'src/utils/has-user-agent';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private authService: AuthService) {}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    let hasAccessTokenUser: any;
    let hasRefreshTokenUser: any;

    try {
      // для моб устройств например проверку проводить не по рефреш токену и verify, а по uuid запрособ в бд
      // срок жизни рефреш токена соответственно тогда вытаскивать из бд, если истекло при первой же проверке удаляем из бд, отправляя 401 ответ,
      // заставляя фронт отправить refresh token запрпос
      const authHeader = req.headers.authorization;
      const bearer = authHeader.split(' ')[0];
      var accessToken = authHeader.split(' ')[1];
      console.log('accessToken', accessToken);
      if (bearer !== 'Bearer' || !accessToken) {
        throw new UnauthorizedException({ message: 'Пользователь не авторизован' });
      }
      hasAccessTokenUser = this.jwtService.verify(accessToken);
      console.log(hasAccessTokenUser);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new HttpException(`Срок действия access токена истек`, HttpStatus.UNAUTHORIZED);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        // тут также из кук удаляем рефреш токен, потому-что если access токен отсутствует или неправильного формата, то не получится его обновить
        res.clearCookie('sid');
        res.clearCookie('token');
        throw new HttpException(
          `Неверный формат access токена авторизации или он отсутствует`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    try {
      var refreshToken = req.cookies?.['token'];
      console.log('refreshToken', refreshToken);
      if (!refreshToken) {
        throw new UnauthorizedException({ message: 'Пользователь не авторизован' });
      }
      hasRefreshTokenUser = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      console.log(hasRefreshTokenUser);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        this.authService.removeToken(refreshToken);
        // очищаем куки и выкидываем пользователя из приложения, на фронте удалить access-token
        res.clearCookie('sid');
        res.clearCookie('token');
        throw new HttpException(`Срок действия рефреш токена истек`, HttpStatus.UNAUTHORIZED);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        res.clearCookie('sid');
        res.clearCookie('token');
        throw new HttpException(
          `Неверный формат рефреш токена авторизации или он отсутствует`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (hasAccessTokenUser.email !== hasRefreshTokenUser.email) {
      throw new UnauthorizedException({ message: 'Ваши токены входа не совпадают' });
    }

    req.user = hasAccessTokenUser;
    return true;
  }
}
