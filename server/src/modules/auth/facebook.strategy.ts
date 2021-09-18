// TODO: добавить регистрацию с созданием юзера по facebookid, если пользователь с таким id уже существует, просто аутенфикация 
// реализовать бизнес логику в сервисе
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';

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
    const { name, emails, photos, id } = profile;
    const user = {
      id,
      email: emails[0]?.value ?? null,
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
