import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entity';
// import { getMongoRepository } from 'typeorm';
import { UserDto } from '../users/dto';
import { RefreshTokenSessionsEntity } from './entity';
import { UserRolesEntity } from '../roles/entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private readonly userModel: Repository<UserEntity>,
    @InjectRepository(RefreshTokenSessionsEntity)
    private readonly tokenModel: Repository<RefreshTokenSessionsEntity>,
    @InjectRepository(UserRolesEntity)
    private readonly userRolesModel: Repository<UserRolesEntity>,
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

  googleLogin(req) {
    if (!req.user) {
      return 'No user from google';
    }

    return {
      message: 'User information from google',
      user: req.user,
    };
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
    const userDto = new UserDto(userData); // оставляем только id, email, roles, isActivated
    const tokens = await this.generateToken({ ...userDto });
    console.log('userData', userData, 74);
    console.log('userDto', userDto, 75);
    console.log('userDto.id', userDto.id, 76);
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
      console.log('токена нету');
      console.log(hasToken);
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
      console.log(userData, 'auth-service', 121);
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
