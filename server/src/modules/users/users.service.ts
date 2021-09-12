import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { RoleService } from './../roles/roles.service';
import {
  AddRoleDto,
  BanUserDto,
  CreateUserDto,
  RoleQueryDto,
  // UpdateUserDto,
  UserDto,
  UserQueryDto,
} from './dto';
import { UserEntity } from './entity';
import { UserRolesEntity } from '../roles/entity';
import { AuthService } from '../auth/auth.service';
import { MailService } from '../mail/mail.service';
// import { Role } from '../roles/schemas';
// import { RefreshTokenSessions, RefreshTokenSessionsDocument } from '../auth/schemas';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity) private readonly userModel: Repository<UserEntity>,
    @InjectRepository(UserRolesEntity) private readonly userRolesModel: Repository<UserRolesEntity>,
    private authService: AuthService,
    private roleService: RoleService,
    private jwtService: JwtService,
    private mailService: MailService, // @InjectModel(RefreshTokenSessions.name) // private readonly tokenModel: Model<RefreshTokenSessionsDocument>,
  ) {}

  async createUser(dto: CreateUserDto): Promise<any & UserDto> {
    const candidate = await this.authService.getUserByEmail(dto.email);
    console.log(dto)
    if (candidate) {
      throw new HttpException(
        `Пользователь с почтовым адресом ${dto.email} уже существует`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const hashPassword = await bcrypt.hash(dto.password, 5);
    const activationLink = uuidv4();
    const roleId = await this.roleService.getRoleByValue('USER');

    let createdUser = new UserEntity();
    // createdUser = { ...dto };
    createdUser.email = dto.email;
    createdUser.password = hashPassword;
    createdUser.activationLink = activationLink;
    const user = await createdUser.save();

    let commonUsRol = new UserRolesEntity();
    commonUsRol.roleId = roleId.id;
    commonUsRol.userId = user.id;
    await commonUsRol.save();

    await this.mailService.sendActivationMail(
      dto.email,
      `${process.env.API_URL}/api/auth/activate/${activationLink}`,
    );
    const userDataAndTokens = await this.authService.tokenSession(createdUser);
    return userDataAndTokens;
  }

  // ДОБАВИТЬ СОРТИРОВКУ В НЕСКОЛЬКИХ ВАРИАНТАХ
  async getAllUsers(query: UserQueryDto): Promise<CreateUserDto[]> {
    return this.userModel.find();
    // .skip(Number(query.offset) ?? 0)
    // .limit(Number(query.limit) ?? 20)
    // .sort('-created') // по дате создания, по убыванию
    // .lean()
    // .exec();
  }

  async getOneUser(id: string): Promise<UserEntity | undefined> {
    return this.userModel.findOneOrFail(id);
  }

  async getMeAccount(token: string) {
    const tokenCode = token.split(' ')[1];
    const user = this.jwtService.verify(tokenCode);
    return this.userModel.findOneOrFail({ email: user.email });
  }

  async deleteUserOne(id: string) {
    if (!id) throw new Error('id не указан');
    const deletedUser = await this.userModel.delete(id);
    return deletedUser;
  }

  // async banUser(userid: string, dto: BanUserDto) {
  //   const user = await this.userModel(UserEntity).findOne({ _id: userid });
  //   if (user.banned)
  //     throw new HttpException(`Данный пользователь уже забанен`, HttpStatus.METHOD_NOT_ALLOWED);
  //   const role = await this.roleService.getRoleByValue('BANNED');
  //   if (!user || !role)
  //     throw new HttpException('Пользователь или роль не найдены', HttpStatus.NOT_FOUND);
  //   user.roles.splice(0, [...user.roles].length, role['_id']);
  //   const bannedUser = await this.userModel
  //     .findByIdAndUpdate(
  //       userid,
  //       {
  //         roles: user.roles,
  //         banned: true,
  //         banReason: dto.banReason,
  //       },
  //       { new: true },
  //     )
  //     .populate('roles')
  //     .lean();
  //   await this.tokenModel.deleteOne({ userId: Object(userid) }).lean();
  //   return bannedUser;
  // }

  // async unlockUser(userid: string) {
  //   const user = await this.userModel.findById({ _id: userid }).lean();
  //   if (!user.banned)
  //     throw new HttpException(`Данный пользователь не забанен`, HttpStatus.METHOD_NOT_ALLOWED);
  //   const role = await this.roleService.getRoleByValue('USER');
  //   if (!user || !role)
  //     throw new HttpException('Пользователь или роль не найдены', HttpStatus.NOT_FOUND);
  //   const unlockUserRole = await this.userModel
  //     .findByIdAndUpdate(
  //       userid,
  //       { roles: [role['_id']], banned: false, banReason: null },
  //       { new: true },
  //     )
  //     .populate('roles')
  //     .lean();
  //   return unlockUserRole;
  // }

  // РЕФАКТОРИНГ pipe id
  // async addRoleUser(userid: string, dto: AddRoleDto) {
  //   if (!userid.match(/^[0-9a-fA-F]{24}$/)) {
  //     throw new HttpException(
  //       'id указан неверно, по причине не соответствия формату ObjectId',
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  //   const user = await this.userModel(UserEntity).findOne({ _id: userid }).lean();
  //   const role = await this.roleService.getRoleByValue(dto.value);
  //   if (!user || !role)
  //     throw new HttpException('Пользователь или роль не найдены', HttpStatus.NOT_FOUND);
  //   const roles = user.roles.some(item => item['_id'].toString() === role['_id'].toString());
  //   if (user.banned)
  //     throw new HttpException(
  //       `Данный пользователь забанен, разблокируйте его прежде чем добавлять новые роли`,
  //       HttpStatus.METHOD_NOT_ALLOWED,
  //     );
  //   if (roles)
  //     throw new HttpException(
  //       `роль ${dto.value} уже была добавлена данному пользователю`,
  //       HttpStatus.METHOD_NOT_ALLOWED,
  //     );
  //   const userRoleUpdate = await this.userModel
  //     .findByIdAndUpdate(userid, { roles: [...user.roles, role] }, { new: true })
  //     .populate('roles')
  //     .lean();
  //   return userRoleUpdate;
  // }

  // РЕФАКТОРИНГ pipe id
  //   async removeRoleUser(query: RoleQueryDto) {
  //     if (!query.userId) throw new HttpException('id не указан', HttpStatus.BAD_REQUEST); // перенести в pipe по id
  //     if (!query.userId.match(/^[0-9a-fA-F]{24}$/)) {
  //       throw new HttpException(
  //         'id указан неверно, по причине не соответствия формату ObjectId',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     }
  //     const user = await this.userModel(UserEntity).findOne({ _id: query.userId });
  //     const role = await this.roleService.getRoleByValue(query.value);
  //     if (!user || !role)
  //       throw new HttpException('Пользователь или роль не найдены', HttpStatus.NOT_FOUND);
  //     if (user.roles.length === 0)
  //       throw new HttpException(
  //         'У пользователя не осталось больше ролей для удаления',
  //         HttpStatus.NOT_FOUND,
  //       );
  //     const roles = user.roles.filter((roleId: any) => roleId.toString() !== role['_id'].toString());
  //     const deletedUserRole = await this.userModel
  //       .findByIdAndUpdate(
  //         query.userId,
  //         {
  //           roles,
  //         },
  //         { new: true },
  //       )
  //       .populate('roles')
  //       .lean();
  //     return deletedUserRole;
  //   }
}
