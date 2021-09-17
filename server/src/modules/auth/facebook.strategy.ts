// если почты не существует, зарегистрировать напрямую
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { config } from 'dotenv';

config();

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      scope: 'email',
      profileFields: ['emails', 'name', 'photos'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user?: any, info?: any) => void,
  ): Promise<any> {
    console.log(profile);
    const { name, emails, photos } = profile;
    const user = {
      // email: emails[0]?.value,
      photos: photos?.values,
      firstName: name?.givenName,
      lastName: name?.familyName,
    };
    const payload = {
      user,
      accessToken,
    };
    done(null, payload);
  }
}
