import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
// import { Request } from 'express';

@Injectable()
export class AuthSessionIdGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    try {
      const req: any = context.switchToHttp().getRequest();
      if (req.session && req.session.userId) {
        console.log(req.session.userId);
        return true;
      }
    } catch (error) {
      console.log(error.message);
      throw new UnauthorizedException({ message: 'Пользователь не авторизован' });
    }
  }
}
