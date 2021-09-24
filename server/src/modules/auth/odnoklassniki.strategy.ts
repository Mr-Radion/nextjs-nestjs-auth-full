import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-odnoklassniki';

@Injectable()
export class OdnoklassnikiStrategy extends PassportStrategy(Strategy, 'odnoklassniki') {
  constructor() {
    super({
      clientID: process.env.ODNOKLASSNIKI_APP_ID,
      clientSecret: process.env.ODNOKLASSNIKI_APP_SECRET,
      callbackURL: process.env.ODNOKLASSNIKI_CALLBACK_URL,
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
      odnoklassnikiId: id,
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

// http://www.passportjs.org/packages/passport-odnoklassniki/
