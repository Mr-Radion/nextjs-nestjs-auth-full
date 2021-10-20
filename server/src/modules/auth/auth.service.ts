import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectTwilio, TwilioClient } from 'nestjs-twilio';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { UserEntity } from '../users/entity';
import { UserDto } from '../users/dto';
import { RefreshTokenSessionsEntity } from './entity';
import { UserRolesEntity } from '../roles/entity';
import { RoleService } from '../roles/roles.service';
import { MailService } from '../mail/mail.service';
import { PhoneService } from '../phone/phone.service';
// import passfather from 'passfather';
import { generate } from 'generate-password';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private readonly userModel: Repository<UserEntity>,
    @InjectRepository(RefreshTokenSessionsEntity)
    private readonly tokenModel: Repository<RefreshTokenSessionsEntity>,
    private roleService: RoleService,
    private jwtService: JwtService,
    private mailService: MailService,
    private phoneService: PhoneService,
    @InjectTwilio() private readonly client: TwilioClient,
    private connection: Connection, // TypeORM transactions. // private readonly userRolesModel: Repository<UserRolesEntity>,
  ) {}

  async login(userData: any, ip: string, ua: any, fingerprint, os: any) {
    try {
      const user = await this.validateUser(userData);
      if (user.banned)
        throw new UnauthorizedException({
          message: `Вы забанены ${user.banReason}`,
        });
      // console.log({ fingerprint: userData.fingerprint });
      const userDataAndTokens = await this.tokenSession(user, ip, ua, fingerprint, os);
      return userDataAndTokens;
    } catch (error) {
      throw console.log(error);
    }
  }

  // отправляем сгенерированный одноразовый код на почту
  async loginMail(email: string) {}

  // проверка валидности одноразового кода, мгновенная активация аккаунта через почту,
  // возможность вместо ввода кода входить прямо по ссылке в свой аккаунт на сайте
  async verifyMail(
    email: string,
    code: string,
    ip: string,
    ua: string,
    fingerprint: string,
    os: string,
  ) {}

  async sendPhone(TARGET_PHONE_NUMBER: string) {
    return await this.phoneService.sendPhoneSMS(TARGET_PHONE_NUMBER);
  }

  async phoneLoginService(TARGET_PHONE_NUMBER: string, channel?: string) {
    return await this.phoneService.login(TARGET_PHONE_NUMBER, channel);
  }

  async phoneVerifyService(
    TARGET_PHONE_NUMBER: string,
    code: string,
    ip: string,
    ua: string,
    fingerprint: string,
    os: string,
  ) {
    const result = await this.phoneService.verify(TARGET_PHONE_NUMBER, code);
    const hasPhone = await this.getUserByPhone(TARGET_PHONE_NUMBER);
    let createUser: any;

    if (result.valid) {
      if (!hasPhone) {
        // user creation
        createUser = new UserEntity();
        createUser.phone = TARGET_PHONE_NUMBER;
        createUser.isActivated = true;
        await createUser.save();

        // adding user role
        const roleId = await this.roleService.getRoleByValue('USER');
        let commonUsRol = new UserRolesEntity();
        commonUsRol.roleId = roleId.id;
        commonUsRol.userId = createUser.id;
        await commonUsRol.save();
      }

      const userDataAndTokens = await this.tokenSession(
        hasPhone ?? createUser,
        ip,
        ua,
        fingerprint,
        os,
      );

      return {
        message: 'User is Verified!!',
        status: result.status, // 'pending', 'approved' or 'canceled'
        // after the first successful attempt, the code becomes invalid for its own re-check it will give a 404 status
        valid: result.valid, // validity of the code submitted by the user
        /* if wrong code
          verifyResult: {
            sid: 'VE################################',
            serviceSid: 'VA################################',
            accountSid: 'AC################################',
            to: '+79031671617',
            channel: 'sms',
            status: 'pending',
            valid: false,
            amount: null,
            payee: null,
            dateCreated: 2021-10-19T15:38:52.000Z,
            dateUpdated: 2021-10-19T15:40:31.000Z
          }
        */
        // timer дата от или/и до?
        dateCreated: result.dateCreated, // data created code
        dateUpdated: result.dateUpdated, // data update code
        ...userDataAndTokens,
      };
    }

    return result; // не забыть, что должны возвращаться данные не только токенов и пользователя, но и от мобильного из ендпоинта
  }

  async autinficateSocialNetwork(req: any, ip: any, socId: any) {
    if (!req.user) {
      return `No user from ${req.user.provider}`;
    }

    let { googleId, facebookId, vkontakteId, mailruId, odnoklassnikiId } = {
      googleId: req.user[socId],
      facebookId: req.user[socId],
      vkontakteId: req.user[socId],
      mailruId: req.user[socId],
      odnoklassnikiId: req.user[socId],
    };

    const { firstName, lastName, email, avatar } = req.user;

    // here google or email
    // const findUser = await this.userModel.findOne({
    //   where: [{ googleId, facebookId, vkontakteId, mailruId, odnoklassnikiId }, { email }],
    // });
    const findUser = await this.userModel
      .createQueryBuilder('user')
      .where(`user.${socId} = :${socId} OR user.email = :email`, {
        googleId,
        facebookId,
        vkontakteId,
        mailruId,
        odnoklassnikiId,
        email,
      })
      .getOne();

    // if you previously registered with a password through the specified mail, then use it to log in through the social network, combining data
    if (findUser?.email && !findUser.googleId) {
      const obj = {};
      for (let [key, value] of Object.entries(req.user)) {
        Object.keys(findUser).indexOf(key) !== -1 && !findUser[key] ? (obj[key] = value) : '';
      }
      await this.userModel.update(findUser.id, obj);
    }

    let createUser: any;

    // user registration
    if (!findUser) {
      // user creation
      createUser = new UserEntity();
      createUser[socId] = req.user[socId];
      createUser.email = email;
      createUser.firstName = firstName;
      createUser.lastName = lastName;
      createUser.avatar = avatar;

      // we generate a password and hash so that the user can enter the system if necessary through a pair of login and password
      // we send a couple to the mail together with a request to activate the account
      let generatedPassword: string;
      if (!createUser.password) {
        generatedPassword = generate({
          length: 10,
          numbers: true,
          symbols: true,
        });
        const hashPassword = await bcrypt.hash(generatedPassword, 5);
        createUser.password = hashPassword;
      }
      const activationLink = uuidv4();
      await this.mailService.sendActivationMail(
        email,
        `${process.env.API_URL}/api/auth/activate/${activationLink}`,
        generatedPassword,
      );
      await createUser.save();

      // adding user role
      const roleId = await this.roleService.getRoleByValue('USER');
      let commonUsRol = new UserRolesEntity();
      commonUsRol.roleId = roleId.id;
      commonUsRol.userId = createUser.id;
      await commonUsRol.save();
    }

    if (findUser?.banned || createUser?.banned)
      throw new UnauthorizedException({
        message: `Вы забанены ${findUser.banReason || createUser.banReason}`,
      });

    return findUser ?? createUser;
  }

  async googleLogin(req: any, ip: string, socId: any) {
    return this.autinficateSocialNetwork(req, ip, socId);
  }

  async facebookLogin(req: any, ip: string, socId: any) {
    return this.autinficateSocialNetwork(req, ip, socId);
  }

  async vkontakteLogin(req: any, ip: string, socId: any) {
    return this.autinficateSocialNetwork(req, ip, socId);
  }

  async odnoklassnikiLogin(req: any, ip: string, socId: any) {
    return this.autinficateSocialNetwork(req, ip, socId);
  }

  async mailruLogin(req: any, ip: string, socId: any) {
    return this.autinficateSocialNetwork(req, ip, socId);
  }

  async logout(refreshToken: string) {
    const token = await this.removeToken(refreshToken);
    return token;
  }

  async activateAccount(activationLink: string): Promise<any> {
    const user = await this.userModel.findOne({ activationLink: activationLink });
    if (!user) {
      throw new HttpException(`Некорректная ссылка активации`, HttpStatus.BAD_REQUEST);
    }
    user.isActivated = true;
    await user.save();
    return user;
  }

  async refreshToken(
    refreshtoken: string,
    ip: string,
    ua: any,
    os: any,
    res: any,
    fingerprint: any,
  ) {
    if (!refreshtoken) throw new UnauthorizedException({ message: 'Пользователь не авторизован' });
    const userData = this.validateRefreshToken(refreshtoken);
    // если нету рефреш токена, мы не создаем через данный сервис новый, чтобы при необходимости иметь возможность удалять рефреш токен, чтобы разлогинить пользователей
    const tokenDb = await this.findToken(refreshtoken);
    if (!tokenDb) {
      res.clearCookie('sid');
      res.clearCookie('token');
      throw new UnauthorizedException({
        message:
          'refreshToken service: рефреш токен отсутствует в базе и пользователь не авторизован',
      });
    }
    const user = await this.userModel.findOne(userData.id);
    if (user.banned)
      throw new UnauthorizedException({
        message: `Вы забанены ${user.banReason}`,
      });
    const userDataAndTokens = await this.tokenSession(user, ip, ua, fingerprint, os);
    return userDataAndTokens;
  }

  async tokenSession(userData: any, ip: string, ua: any, fingerprint?: any, os?: any) {
    if (!userData)
      throw new UnauthorizedException({
        message: 'Пользователь с данным ID отсутствует в базе',
      });

    // pulling out roles for results
    if (!userData.roles) {
      const userRoles: any = await this.connection
        .getRepository(UserRolesEntity)
        .createQueryBuilder('user-roles')
        .innerJoinAndSelect('user-roles.role', 'role')
        .where('user-roles.userId = :id', {
          id: userData.id,
        })
        .getMany();

      userData.roles = userRoles.map(userRoles => userRoles.role);
    }

    const userDto = new UserDto(userData); // leave merely id, facebookId, googleId, email, roles, isActivated, phone
    const tokens = await this.generateToken({ ...userDto });
    await this.saveToken(userData.id, tokens.refreshToken, ip, ua, os, fingerprint);
    return {
      statusCode: HttpStatus.OK,
      message: 'User information',
      user: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken, // refresh token only for mobile app
        user: userDto,
      },
    };
  }

  async getUserByEmail(email: string) {
    const user = await this.userModel.findOne({ email });
    return user;
  }

  async getUserByPhone(phone: string) {
    const user = await this.userModel.findOne({ phone });
    return user;
  }

  async generateToken(user: any) {
    const payload = { email: user.email, id: user.id, roles: user.roles };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '10m',
    });
    // refreshToken в куках служит подтверждением авторизации пользователя, после истечения срока access tokena,
    // без него не получить новый access token в обновлении с помощью маршрута auth/refresh
    //
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '60d',
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  async saveToken(
    userId: any,
    refreshToken: string,
    ip: string,
    ua: any,
    os?: any,
    fingerprint?: any,
  ) {
    if (!fingerprint) {
      // !!! иметь ввиду, что для моб приложений, стоит добавить условие исключив их из этого исключения
      console.log('Отсутствует отпечаток браузера!');
      throw new HttpException(`Отсутствует отпечаток браузера!`, HttpStatus.BAD_REQUEST);
    }
    const hasToken = await this.tokenModel.find({ user: userId, fingerprint });

    // create a token from scratch for a new user or after deleting an old token
    if (!hasToken.length) {
      // Ситуации когда создается новая запись с токеном, вместо обновления существующей записи
      // 1. регистрация пользователя
      // 2. авторизация после выхода
      // 3. авторизация после устаревания рефреш токена
      // - (что не случится если пользоваться ресурсом в течении 60 дн, всегда срок refresh tokena обновляется, вместе с access токеном,
      // при выходе и входе или обновлении токенов через refresh)
      // 4. авторизация в другом браузере

      const createdToken = this.tokenModel.create({
        user: userId,
        refreshToken,
        ip,
        ua,
        os,
        fingerprint,
        expiresIn: '',
      });

      return await this.tokenModel.save(createdToken);
    }

    // Ситуации когда обновляется существующая запись, вместо создания
    // 1. Когда пользователь выполняет обновление существующего рефреш токена в браузере, из-за устаревания access tokena и получая новую пару
    // 2. Если по каким-либо причинам программно совершен повторный вход с одного и того же браузера и одним и тем же userId, без выхода до этого,
    // как защита от дурака
    hasToken[0].refreshToken = refreshToken;
    const tokenData = await this.tokenModel.save(hasToken);

    return tokenData;
  }

  async removeToken(refreshToken: string) {
    // const tokenData = await this.tokenModel.update({ refreshToken }, { refreshToken: null });
    const tokenData = await this.tokenModel.delete({ refreshToken });
    return tokenData;
  }

  async validateUser(userData: any): Promise<any> {
    try {
      const user = await this.getUserByEmail(userData.email);
      if (!user)
        throw new UnauthorizedException({
          message: `Пользователь с email ${userData.email} не найден`,
        });
      const isPasswordEquals = await bcrypt.compare(userData.password, user.password);
      if (!isPasswordEquals) throw new UnauthorizedException({ message: `Неверный пароль` });
      const { password, ...result } = user;
      return result;
    } catch (error) {
      throw console.log(error);
    }
  }

  private validateRefreshToken(token: string) {
    try {
      const userData = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      return userData;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        this.removeToken(token);
        throw new HttpException(`Срок действия рефреш токена истек`, HttpStatus.BAD_REQUEST);
      }
      if (error instanceof jwt.JsonWebTokenError)
        throw new HttpException(`Неверный формат рефреш токена`, HttpStatus.BAD_REQUEST);
    }
  }

  private async findToken(refreshToken: string) {
    try {
      const tokenData = await this.tokenModel.findOne({ refreshToken });
      return tokenData;
    } catch (error) {
      console.log('findToken', error.message);
      throw new UnauthorizedException({
        message: 'findToken service: рефреш токен отсутствует в базе и пользователь не авторизован',
      });
    }
  }
}
