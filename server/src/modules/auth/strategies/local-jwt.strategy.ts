import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from 'jsonwebtoken';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

// another option for checking jwt token using PassportStrategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_KEY,
    });
  }

  // Passport first verifies the JWT's signature and decodes the JSON. It then invokes our validate()
  // Passport will build a user object based on the return value of our validate() method, and attach it as a property on the Request object.
  // we could do a database lookup in our validate() method to extract more information about the user, resulting in a more enriched user object
  // being available in our Request. This is also the place we may decide to do further token validation, such as looking up the userId in a list
  // of revoked tokens, enabling us to perform token revocation.
  async validate(payload: JwtPayload): Promise<any> {
    console.log(payload);
    return { userId: payload.id, email: payload.email };
    // const { email } = payload;
    // const user = await this.authService.getUserByEmail(email);

    // if (!user) {
    //   throw new UnauthorizedException();
    // }

    // return user;
  }
}

// https://github.com/mikenicholson/passport-jwt
