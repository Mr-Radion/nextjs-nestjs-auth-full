import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-mail';

@Injectable()
export class MailruStrategy extends PassportStrategy(Strategy, 'mailru') {
  constructor() {
    super({
      clientID: process.env.MAILRU_APP_ID,
      clientSecret: process.env.MAILRU_APP_SECRET,
      callbackURL: process.env.MAILRU_CALLBACK_URL,
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
      mailruId: id,
      email: emails[0]?.value ?? null,
      avatar: photos?.values,
      firstName: name?.givenName,
      lastName: name?.familyName,
      accessToken,
    };
    done(null, user);
  }
}

// http://www.passportjs.org/packages/passport-mail
