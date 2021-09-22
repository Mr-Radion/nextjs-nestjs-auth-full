import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entity';
import { UserDto } from '../users/dto';
import { RefreshTokenSessionsEntity } from './entity';
import { UserRolesEntity } from '../roles/entity';
import { RoleService } from '../roles/roles.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private readonly userModel: Repository<UserEntity>,
    @InjectRepository(RefreshTokenSessionsEntity)
    private readonly tokenModel: Repository<RefreshTokenSessionsEntity>,
    @InjectRepository(UserRolesEntity)
    private readonly userRolesModel: Repository<UserRolesEntity>,
    private roleService: RoleService,
    private jwtService: JwtService,
  ) {}

  async login(userData: any, ip: string) {
    try {
      const user = await this.validateUser(userData);
      if (user.banned)
        throw new UnauthorizedException({
          message: `Вы забанены ${user.banReason}`,
        });
      const userDataAndTokens = await this.tokenSession(user, ip);
      return userDataAndTokens;
    } catch (error) {
      throw console.log(error);
    }
  }

  async autinficateSocialNetwork(req: any, ip: any, socId: any) {
    if (!req.user) {
      return 'No user from google';
    }

    let { googleId, facebookId, vkontakteId, mailruId, odnoklassnikiId } = {
      googleId: req.user[socId],
      facebookId: req.user[socId],
      vkontakteId: req.user[socId],
      mailruId: req.user[socId],
      odnoklassnikiId: req.user[socId],
    };

    const { firstName, lastName, email, avatar } = req.user;

    // Здесь googleId OR email
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

    // если через указанную почту ранее регистрировались с паролем, потом используют для входа через соц сеть,
    // можно таким образом объединить данные аккаунтов
    if (findUser?.email && !findUser.googleId) {
      const obj = {};
      for (let [key, value] of Object.entries(req.user)) {
        Object.keys(findUser).indexOf(key) !== -1 && !findUser[key] ? (obj[key] = value) : '';
      }
      await this.userModel.update(findUser.id, obj);
    }

    let createUser: any;

    // // регистрация пользователя
    if (!findUser) {
      // создание юзера
      createUser = new UserEntity();
      createUser[socId] = req.user[socId];
      createUser.email = email;
      createUser.firstName = firstName;
      createUser.lastName = lastName;
      createUser.avatar = avatar;
      await createUser.save();

      // добавление роли юзера
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

    // сохранение и выдача токенов
    const userDataAndTokens = await this.tokenSession(findUser ?? createUser, ip);

    return {
      statusCode: HttpStatus.OK,
      message: 'User information from google',
      user: userDataAndTokens,
    };
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

  async refreshToken(refreshtoken: string, ip: string) {
    if (!refreshtoken) throw new UnauthorizedException({ message: 'Пользователь не авторизован' });
    const userData = this.validateRefreshToken(refreshtoken);
    const tokenDb = await this.findToken(refreshtoken);
    if (!userData || !tokenDb)
      throw new UnauthorizedException({
        message: 'Рефреш токен неверный или пользователь не авторизован',
      });
    const user = await this.userModel.findOne(userData.id);
    if (user.banned)
      throw new UnauthorizedException({
        message: `Вы забанены ${user.banReason}`,
      });
    const userDataAndTokens = await this.tokenSession(user, ip);
    return userDataAndTokens;
  }

  async tokenSession(userData: any, ip: string) {
    if (!userData)
      throw new UnauthorizedException({
        message: 'Пользователь с данным ID отсутствует в базе',
      });
    // вытаскиваем роли для результатов
    if (!userData.roles) {
      const userRoles = await this.userRolesModel.findOneOrFail(
        { userId: userData.id },
        {
          relations: ['role'],
        },
      );
      userData.roles = userRoles.role;
    }
    const userDto = new UserDto(userData); // оставляем только id, facebookId, googleId, email, roles, isActivated
    const tokens = await this.generateToken({ ...userDto });
    await this.saveToken(userDto.id, tokens.refreshToken, ip);
    return {
      ...tokens,
      user: userDto,
    };
  }

  async getUserByEmail(email: string) {
    const user = await this.userModel.findOne({ email });
    return user;
  }

  async generateToken(user: any) {
    const payload = { email: user.email, id: user.id, roles: user.roles };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '60d',
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  async saveToken(userId: any, refreshToken: string, ip: string) {
    const hasToken = await this.tokenModel.findByIds(userId);
    // создаем токен с нуля для нового пользователя или после удаления старого токена
    if (!hasToken) {
      // const createdToken = new RefreshTokenSessionsEntity({ user: userId, refreshToken });
      const createdToken = this.tokenModel.create({ user: userId, refreshToken, ip });
      return await this.tokenModel.save(createdToken);
    }
    const tokenData = await this.tokenModel.update(userId, { user: userId, refreshToken, ip });
    return tokenData;
  }

  async removeToken(refreshToken: string) {
    const tokenData = await this.tokenModel.update({ refreshToken }, { refreshToken: null });
    return tokenData;
  }

  private async validateUser(userData: any): Promise<any> {
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
        // this.removeToken(token);
        throw new HttpException(`Срок действия токена истек`, HttpStatus.BAD_REQUEST);
      }
      if (error instanceof jwt.JsonWebTokenError)
        throw new HttpException(`Неверный формат рефреш токена`, HttpStatus.BAD_REQUEST);
    }
  }

  private async findToken(refreshToken: string) {
    const tokenData = await this.tokenModel.findOne({ refreshToken });
    return tokenData;
  }
}
