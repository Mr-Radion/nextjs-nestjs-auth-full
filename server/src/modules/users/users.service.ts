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
import { RefreshTokenSessionsEntity } from '../auth/entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity) private readonly userModel: Repository<UserEntity>,
    @InjectRepository(UserRolesEntity) private readonly userRolesModel: Repository<UserRolesEntity>,
    @InjectRepository(RefreshTokenSessionsEntity)
    private readonly tokenModel: Repository<RefreshTokenSessionsEntity>,
    private authService: AuthService,
    private roleService: RoleService,
    private jwtService: JwtService,
    private mailService: MailService, // @InjectModel(RefreshTokenSessions.name) // private readonly tokenModel: Model<RefreshTokenSessionsDocument>,
  ) {}

  async createUser(dto: CreateUserDto): Promise<any & UserDto> {
    const candidate = await this.authService.getUserByEmail(dto.email);
    console.log(dto);
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
    console.log(userDataAndTokens); // надо проверить, сохраняется ли рефреш токен в бд, если нет, то почему
    return userDataAndTokens;
  }

  // ДОБАВИТЬ СОРТИРОВКУ В НЕСКОЛЬКИХ ВАРИАНТАХ
  async getAllUsers(query: UserQueryDto): Promise<CreateUserDto[]> {
    return this.userModel.find();
    // TODO: о сортировке, транзакциях разузнать
    // https://coderoad.ru/61625105/%D0%9F%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D1%82%D0%B5%D0%BB%D1%8C%D1%81%D0%BA%D0%B8%D0%B9-%D1%82%D0%B8%D0%BF-%D1%81%D0%BE%D1%80%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%BA%D0%B8-typeorm
  }

  async getOneUser(id: string): Promise<UserEntity | undefined> {
    return this.userModel.findOneOrFail(id);
  }

  async getMeAccount(token: string) {
    const tokenCode = token.split(' ')[1];
    const user = this.jwtService.verify(tokenCode);
    return this.userModel.findOneOrFail({ email: user.email });
  }

  async deleteUserOne(userId: string) {
    if (!userId) throw new Error('id не указан');
    // удаляем связанные роли
    await this.userRolesModel.delete({
      userId: Number(userId),
    });
    // удаляем пользователя
    const deletedUser = await this.userModel.delete(userId);
    return deletedUser;
  }

  async banUser(userId: string, dto: BanUserDto) {
    const user = await this.userModel.findOneOrFail({ id: Number(userId) });
    if (user.banned)
      throw new HttpException(`Данный пользователь уже забанен`, HttpStatus.METHOD_NOT_ALLOWED);
    // const role = await this.roleService.getRoleByValue('BANNED');
    // if (!user || !role)
    //   throw new HttpException('Пользователь или роль не найдены', HttpStatus.NOT_FOUND);
    if (!user) throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    // удаление всех ролей пользователя
    await this.userRolesModel.delete(userId);
    // баним пользователя
    user.banned = true;
    // добавляем описание бана
    user.banReason = dto.banReason;
    // удаляем рефреш токен
    await this.tokenModel.delete(userId);
    return user.save();
  }

  async unlockUser(userId: string) {
    const user = await this.userModel.findOneOrFail({ id: Number(userId) });
    if (!user.banned)
      throw new HttpException(`Данный пользователь не забанен`, HttpStatus.METHOD_NOT_ALLOWED);
    const role = await this.roleService.getRoleByValue('USER');
    if (!user || !role)
      throw new HttpException('Пользователь или роль не найдены', HttpStatus.NOT_FOUND);
    // добавляем роль USER пользователю и сохраняем в бд
    const userRoles = await this.userRolesModel
      .create({ userId: Number(userId), roleId: role.id })
      .save();
    // отменяем бан и стираем его причину
    user.banned = false;
    user.banReason = null;
    // сохраняем изменения в бд
    const userResult = await user.save();
    // // вытаскиваем результат вместе с информацией о добавленной роли
    // const userResult = await this.userModel.findOneOrFail(
    //   { id: Number(userId) },
    //   {
    //     relations: ['userRolesEntity'],
    //   },
    // );
    return {
      userResult,
      userRoles,
    };
  }

  async addRoleUser(userId: string, dto: AddRoleDto) {
    const user = await this.userModel.findOne({ id: Number(userId) });
    const role = await this.roleService.getRoleByValue(dto.value);
    if (!user || !role)
      throw new HttpException('Пользователь или роль не найдены', HttpStatus.NOT_FOUND);
    if (user.banned)
      throw new HttpException(
        `Данный пользователь забанен, разблокируйте его прежде чем добавлять новые роли`,
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    // проверяем наличие данной роли у пользователя по id роли
    const hasRole = user.userRolesEntity.some(item => item.id.toString() === role.id.toString());
    if (hasRole)
      throw new HttpException(
        `роль ${dto.value} уже была добавлена данному пользователю`,
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    // добавляем указанную роль пользователю
    const userRoleUpdate = await this.userRolesModel
      .create({ userId: Number(userId), roleId: role.id })
      .save();
    return userRoleUpdate;
  }

  async removeRoleUser(query: RoleQueryDto) {
    if (!query.userId) throw new HttpException('id не указан', HttpStatus.BAD_REQUEST); // перенести в pipe по id
    const user = await this.userModel.findOne({ id: Number(query.userId) });
    const role = await this.roleService.getRoleByValue(query.value);
    if (!user || !role)
      throw new HttpException('Пользователь или роль не найдены', HttpStatus.NOT_FOUND);
    if (user.userRolesEntity.length === 0)
      throw new HttpException(
        'У пользователя не осталось больше ролей для удаления',
        HttpStatus.NOT_FOUND,
      );
    // удаляем конкретную роль пользователя
    const deletedUserRole = await this.userRolesModel.delete({
      userId: Number(query.userId),
      roleId: role.id,
    });
    return deletedUserRole;
  }
}
