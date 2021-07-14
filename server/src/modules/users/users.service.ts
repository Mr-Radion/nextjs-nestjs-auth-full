import { RoleService } from './../roles/roles.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import {
  AddRoleDto,
  BanUserDto,
  CreateUserDto,
  RoleQueryDto,
  UpdateUserDto,
  UserDto,
  UserQueryDto,
} from './dto';
import { User, UserDocument } from './schemas';
import { AuthService } from '../auth/auth.service';
import { MailService } from '../mail/mail.service';
import { Role } from '../roles/schemas';
import { RefreshTokenSessions, RefreshTokenSessionsDocument } from '../auth/schemas';
import { FileService, FileType } from '../file/file.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private authService: AuthService,
    private roleService: RoleService,
    private jwtService: JwtService,
    private mailService: MailService,
    private fileService: FileService,
    @InjectModel(RefreshTokenSessions.name)
    private readonly tokenModel: Model<RefreshTokenSessionsDocument>,
  ) {}

  async createUser(dto: CreateUserDto): Promise<any & UserDto> {
    const candidate = await this.authService.getUserByEmail(dto.email);
    if (candidate) {
      throw new HttpException(
        `Пользователь с почтовым адресом ${dto.email} уже существует`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const hashPassword = await bcrypt.hash(dto.password, 5);
    const activationLink = uuidv4();
    const roleId = await this.roleService.getRoleByValue('USER');
    const createdUser = await this.userModel.create({
      ...dto,
      password: hashPassword,
      activationLink,
      roles: [roleId],
    });
    await this.mailService.sendActivationMail(
      dto.email,
      `${process.env.API_URL}/api/auth/activate/${activationLink}`,
    );
    const userDataAndTokens = await this.authService.tokenSession(createdUser);
    return userDataAndTokens;
  }

  // ДОБАВИТЬ СОРТИРОВКУ В НЕСКОЛЬКИХ ВАРИАНТАХ
  async getAllUsers(query: UserQueryDto): Promise<CreateUserDto[]> {
    return this.userModel
      .find()
      .skip(Number(query.offset) ?? 0)
      .limit(Number(query.limit) ?? 20)
      .sort('-created') // по дате создания, по убыванию
      .lean()
      .exec();
  }

  async getOneUser(id: string): Promise<User | undefined> {
    return this.userModel.findById(id).lean();
  }

  async getMeAccount(token: string) {
    const tokenCode = token.split(' ')[1];
    const user = this.jwtService.verify(tokenCode);
    return this.userModel.findOne({ email: user.email }).lean();
  }

  async deleteUserOne(id: string) {
    if (!id) throw new Error('id не указан');
    const deletedUser = await this.userModel.findByIdAndDelete(id);
    return deletedUser;
  }

  async editUser(id: string, dto: UpdateUserDto) {
    if (!id) throw new HttpException('id не указан', HttpStatus.BAD_REQUEST);
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new HttpException(
        'id указан неверно, по причине не соответствия формату ObjectId',
        HttpStatus.BAD_REQUEST,
      );
    }
    const updateUser = await this.userModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    return updateUser;
  }

  async editMyProfile(token: string, dto: UpdateUserDto) {
    const tokenCode = token.split(' ')[1];
    const user = this.jwtService.verify(tokenCode);
    const updateUser = await this.userModel.findByIdAndUpdate(user.id, dto, {
      new: true,
    });
    return updateUser;
  }

  async updateAvatar(image: any) {
    if (image.size > 5000000)
      return `Ваша фотография весит ${Math.round(
        image.size / 1000000,
      )} мб, разрешенный размер не больше 5 мб`;
    console.log(image, 117);
    const imagePath = this.fileService.createFileLocal(FileType.IMAGE, image);
    console.log(imagePath, 119);
    return imagePath;
  }

  async banUser(userid: string, dto: BanUserDto) {
    const user = await this.userModel.findById({ _id: userid }).lean();
    if (user.banned)
      throw new HttpException(`Данный пользователь уже забанен`, HttpStatus.METHOD_NOT_ALLOWED);
    const role = await this.roleService.getRoleByValue('BANNED');
    if (!user || !role)
      throw new HttpException('Пользователь или роль не найдены', HttpStatus.NOT_FOUND);
    user.roles.splice(0, [...user.roles].length, role['_id']);
    const bannedUser = await this.userModel
      .findByIdAndUpdate(
        userid,
        {
          roles: user.roles,
          banned: true,
          banReason: dto.banReason,
        },
        { new: true },
      )
      .populate('roles')
      .lean();
    await this.tokenModel.deleteOne({ userId: Object(userid) }).lean();
    return bannedUser;
  }

  async unlockUser(userid: string) {
    const user = await this.userModel.findById({ _id: userid }).lean();
    if (!user.banned)
      throw new HttpException(`Данный пользователь не забанен`, HttpStatus.METHOD_NOT_ALLOWED);
    const role = await this.roleService.getRoleByValue('USER');
    if (!user || !role)
      throw new HttpException('Пользователь или роль не найдены', HttpStatus.NOT_FOUND);
    const unlockUserRole = await this.userModel
      .findByIdAndUpdate(
        userid,
        { roles: [role['_id']], banned: false, banReason: null },
        { new: true },
      )
      .populate('roles')
      .lean();
    return unlockUserRole;
  }

  // РЕФАКТОРИНГ pipe id
  async addRoleUser(userid: string, dto: AddRoleDto) {
    if (!userid.match(/^[0-9a-fA-F]{24}$/)) {
      throw new HttpException(
        'id указан неверно, по причине не соответствия формату ObjectId',
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.userModel.findById({ _id: userid }).lean();
    const role = await this.roleService.getRoleByValue(dto.value);
    if (!user || !role)
      throw new HttpException('Пользователь или роль не найдены', HttpStatus.NOT_FOUND);
    const roles = user.roles.some(item => item['_id'].toString() === role['_id'].toString());
    if (user.banned)
      throw new HttpException(
        `Данный пользователь забанен, разблокируйте его прежде чем добавлять новые роли`,
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    if (roles)
      throw new HttpException(
        `роль ${dto.value} уже была добавлена данному пользователю`,
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    const userRoleUpdate = await this.userModel
      .findByIdAndUpdate(userid, { roles: [...user.roles, role] }, { new: true })
      .populate('roles')
      .lean();
    return userRoleUpdate;
  }

  // РЕФАКТОРИНГ pipe id
  async removeRoleUser(query: RoleQueryDto) {
    if (!query.userId) throw new HttpException('id не указан', HttpStatus.BAD_REQUEST); // перенести в pipe по id
    if (!query.userId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new HttpException(
        'id указан неверно, по причине не соответствия формату ObjectId',
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.userModel.findById({ _id: query.userId }).lean();
    const role = await this.roleService.getRoleByValue(query.value);
    if (!user || !role)
      throw new HttpException('Пользователь или роль не найдены', HttpStatus.NOT_FOUND);
    if (user.roles.length === 0)
      throw new HttpException(
        'У пользователя не осталось больше ролей для удаления',
        HttpStatus.NOT_FOUND,
      );
    const roles = user.roles.filter(
      (roleId: LeanDocument<Role>) => roleId.toString() !== role['_id'].toString(),
    );
    const deletedUserRole = await this.userModel
      .findByIdAndUpdate(
        query.userId,
        {
          roles,
        },
        { new: true },
      )
      .populate('roles')
      .lean();
    return deletedUserRole;
  }
}
