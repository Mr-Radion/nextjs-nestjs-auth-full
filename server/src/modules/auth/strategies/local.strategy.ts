import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

// additional way of user validation using PassportStrategy
// 💡 this check by login and password is insecure, and if you are using a passport,
// it is advisable then to check through jwt and the local session strategy (local-jwt.strategy, local-sessionid.strategy)!!!
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser({ email, password });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

// http://www.passportjs.org/docs/configure/
// https://docs.nestjs.com/security/authentication
