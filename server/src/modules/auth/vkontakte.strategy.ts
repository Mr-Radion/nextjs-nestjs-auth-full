import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-vkontakte';

@Injectable()
export class VkontakteStrategy extends PassportStrategy(Strategy, 'vkontakte') {
  constructor() {
    super({
      clientID: process.env.VKONTAKTE_APP_ID,
      clientSecret: process.env.VKONTAKTE_APP_SECRET,
      callbackURL: process.env.VKONTAKTE_CALLBACK_URL,
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
    const { name, emails, photos, id, provider } = profile;
    const user = {
      vkontakteId: id,
      email: emails[0]?.value ?? null,
      avatar: photos[0].value,
      firstName: name?.givenName,
      lastName: name?.familyName,
      provider,
      accessToken,
    };
    done(null, user);
  }
}

// http://www.passportjs.org/packages/passport-vkontakte/
