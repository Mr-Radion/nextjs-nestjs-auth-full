import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User, UserDocument } from '../users/schemas';
import { UserDto } from '../users/dto';
// import { RefreshTokenSessions, RefreshTokenSessionsDocument } from './schemas';

@Injectable()
export class AuthService {
  constructor(
    // @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    // @InjectModel(RefreshTokenSessions.name)
    // private readonly tokenModel: Model<RefreshTokenSessionsDocument>,
    private jwtService: JwtService,
  ) {}

  async login(userData: any) {
    try {
      const user = await this.validateUser(userData);
      if (user.banned)
        throw new UnauthorizedException({
          message: `Вы забанены ${user.banReason}`,
        });
      const userDataAndTokens = await this.tokenSession(user);
      return userDataAndTokens;
    } catch (error) {
      throw console.log(error);
    }
  }

  async logout(refreshToken: string) {
    const token = await this.removeToken(refreshToken);
    return token;
  }

  async activateAccount(activationLink: string): Promise<void> {
    const user = await this.userModel.findOne({ activationLink });
    if (!user) {
      throw new HttpException(`Некорректная ссылка активации`, HttpStatus.BAD_REQUEST);
    }
    user.isActivated = true;
    await user.save();
  }

  async refreshToken(refreshtoken: string) {
    if (!refreshtoken) throw new UnauthorizedException({ message: 'Пользователь не авторизован' });
    const userData = this.validateRefreshToken(refreshtoken);
    const tokenDb = await this.findToken(refreshtoken);
    if (!userData || !tokenDb)
      throw new UnauthorizedException({
        message: 'Рефреш токен неверный или пользователь не авторизован',
      });
    const user = await this.userModel.findById(userData.id);
    if (user.banned)
      throw new UnauthorizedException({
        message: `Вы забанены ${user.banReason}`,
      });
    const userDataAndTokens = await this.tokenSession(user);
    return userDataAndTokens;
  }

  async tokenSession(userData: any) {
    if (!userData)
      throw new UnauthorizedException({
        message: 'Пользователь с данным ID отсутствует в базе',
      });
    const userDto = new UserDto(userData); // id, email, isActivated
    const tokens = await this.generateToken({ ...userDto });
    await this.saveToken(userDto.id, tokens.refreshToken);
    return {
      ...tokens,
      user: userDto,
    };
  }

  async getUserByEmail(email: string) {
    const user = await this.userModel.findOne({ email }).populate('roles').lean();
    console.log(user, 80);
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

  async saveToken(userId, refreshToken: string) {
    const tokenData = await this.tokenModel.findOneAndUpdate(
      { userId: userId },
      { $set: { refreshToken } },
      { new: true },
    );
    if (!tokenData) {
      const createdToken = await this.tokenModel.create({ userId, refreshToken });
      return createdToken;
    }
    return tokenData;
  }

  async removeToken(refreshToken: string) {
    const tokenData = await this.tokenModel.updateOne({ refreshToken }, { refreshToken: null });
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
