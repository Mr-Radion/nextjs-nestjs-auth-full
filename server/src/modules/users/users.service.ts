import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
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
import { RefreshTokenSessionsEntity } from '../auth/entity';
import { FileService } from '../file/file.service';
import { FileType } from '../file/file.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity) private readonly userModel: Repository<UserEntity>,
    @InjectRepository(UserRolesEntity) private readonly userRolesModel: Repository<UserRolesEntity>,
    @InjectRepository(RefreshTokenSessionsEntity)
    private readonly tokenModel: Repository<RefreshTokenSessionsEntity>,
    private authService: AuthService,
    private fileService: FileService,
    private roleService: RoleService,
    private jwtService: JwtService,
    private mailService: MailService,
    private connection: Connection, // TypeORM transactions.
  ) {}

  async createUser(
    dto: CreateUserDto,
    ip: string,
    ua: any,
    fingerprint: any,
    os: any,
  ): Promise<any & UserDto> {
    if (!dto.email) {
      throw new HttpException(`Вы не ввели почту`, HttpStatus.BAD_REQUEST);
    }
    if (!dto.password) {
      throw new HttpException(`Вы не ввели пароль`, HttpStatus.BAD_REQUEST);
    }
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

    // creating with many to many relationship
    // await this.connection.createQueryBuilder().relation(UserEntity, 'roles').of(createdUser).add(roleId);

    await this.mailService.sendActivationMail(
      dto.email,
      `${process.env.API_URL}/api/auth/activate/${activationLink}`,
    );
    const userDataAndTokens = await this.authService.tokenSession(
      createdUser,
      ip,
      ua,
      fingerprint,
      os,
    );
    return userDataAndTokens;
  }

  async createManyUsers(users: CreateUserDto[]) {
    await this.connection.transaction(async manager => {
      await manager.save(users[0]);
      await manager.save(users[1]);
      await manager.save(users[2]);
    });
  }

  // ПРОТЕСТИРОВАТЬ!!!
  async updateAvatar(id: any, file: any): Promise<boolean | undefined> {
    // console.log(id, file)
    const foundUser = await this.userModel.findOne({ id });

    if (!foundUser) {
      throw new NotFoundException('User not found.');
    }

    foundUser.avatar = this.fileService.createFileLocal(FileType.IMAGE, file);

    const updateUser = await this.userModel.save(foundUser);

    return updateUser ? true : false;
  }

  async getAllUsers(query: UserQueryDto): Promise<CreateUserDto[]> {
    const qb = this.userModel.createQueryBuilder('user');

    qb.limit(Number(query.limit) || 0);
    // how many users to skip
    // qb.skip(Number(query.skip) || 0);
    // number of users
    qb.take(Number(query.take) || 10);
    qb.orderBy({
      'user.id': 'ASC', // ascending
      // 'user.created_at': 'DESC',
    });
    // qb.orderBy(
    //   '(CASE WHEN user.nickname IS NULL THEN user.firstName ELSE user.nickname END)',
    // );
    qb.where('user.registered = :registered', { registered: true });
    qb.where('user.isActivated = :isActivated', { isActivated: true });

    return qb.getMany();
  }

  async getOneUser(id: string): Promise<UserEntity | undefined> {
    // количество уникальных просмотров фиксировать в сессиях и сохранять в redis/db
    try {
      return this.userModel.findOneOrFail(id);
    } catch (error) {
      console.log('getOneUser service', error.message);
    }
  }

  async getMeAccount(req: any) {
    // const tokenCode = token.split(' ')[1];
    // const user = this.jwtService.verify(tokenCode);
    console.log('req.user', req.user);
    if (!req.user) {
      console.log('getMeAccount service: пользователь не авторизован!');
      throw new UnauthorizedException({
        message: 'getMeAccount service: пользователь не авторизован!',
      });
    }
    console.log('req.user', req.user);
    const user = await this.userModel.findOneOrFail({ email: req.user.email });
    console.log({ user });
    if (user) return user;
  }

  async deleteUserOne(userId: any) {
    try {
      if (!userId) throw new Error('id не указан');
      // последовательность удаления важна, так как не удалив прежде связанные с юзером
      // записи в других таблицах, не получится удалить пользователя
      // remove all related roles
      await this.userRolesModel.delete({
        userId: Number(userId),
      });
      // удаляем все токены данного пользователя
      await this.tokenModel.delete({ user: userId });
      // delete user
      const deletedUser = await this.userModel.delete(userId);
      return deletedUser;
    } catch (error) {
      console.log('deleteUserOne service', error.message);
    }
  }

  async banUser(userId: any, dto: BanUserDto) {
    const user = await this.userModel.findOneOrFail({ id: Number(userId) });
    if (user.banned)
      throw new HttpException(`Данный пользователь уже забанен`, HttpStatus.METHOD_NOT_ALLOWED);
    // const role = await this.roleService.getRoleByValue('BANNED');
    // if (!user || !role)
    //   throw new HttpException('Пользователь или роль не найдены', HttpStatus.NOT_FOUND);
    if (!user) throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    // removing all user roles
    await this.userRolesModel.delete(userId);
    // ban user
    user.banned = true;
    // add a description of the ban
    user.banReason = dto.banReason;
    // remove the refresh token ТУТ НУЖНО ИЗМЕНИТЬ В СВЯЗИ С МНОЖЕСТВОМ РЕФРЕШ ТОКЕНОВ ПОД КАЖДЫЙ БРАУЗЕР, УДАЛЯЯ СРАЗУ НЕСКОЛЬКО ТОКЕНОВ
    await this.tokenModel.delete({ user: userId });
    return user.save();
  }

  async unlockUser(userId: any) {
    const user = await this.userModel.findOneOrFail({ id: Number(userId) });
    if (!user.banned)
      throw new HttpException(`Данный пользователь не забанен`, HttpStatus.METHOD_NOT_ALLOWED);
    const role = await this.roleService.getRoleByValue('USER');
    if (!user || !role)
      throw new HttpException('Пользователь или роль не найдены', HttpStatus.NOT_FOUND);
    // add the USER role to the user and save it to the database
    const userRoles = await this.userRolesModel
      .create({ userId: Number(userId), roleId: role.id })
      .save();
    // we cancel the ban and erase its reason
    user.banned = false;
    user.banReason = null;
    // save changes to the database
    const userResult = await user.save();
    // we pull out result along with information about the added role
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

  async addRoleUser(userId: any, dto: AddRoleDto) {
    const user = await this.userModel.findOne({ id: Number(userId) });
    const role = await this.roleService.getRoleByValue(dto.value);

    if (!user || !role)
      throw new HttpException('Пользователь или роль не найдены', HttpStatus.NOT_FOUND);
    if (user.banned)
      throw new HttpException(
        `Данный пользователь забанен, разблокируйте его прежде чем добавлять новые роли`,
        HttpStatus.METHOD_NOT_ALLOWED,
      );

    // check whether the user has a given role by role id
    const userRoles: any = await this.connection
      .getRepository(UserRolesEntity)
      .createQueryBuilder('user-roles')
      .innerJoinAndSelect('user-roles.role', 'role')
      .where('user-roles.userId = :userId', {
        userId,
      })
      .getMany();

    const hasRole = userRoles.some(item => item.role.id.toString() === role.id.toString());
    if (hasRole) {
      throw new HttpException(
        `роль ${dto.value} уже была добавлена данному пользователю`,
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }

    // add the specified role to the user
    const userRoleUpdate = await this.userRolesModel
      .create({ userId: Number(userId), roleId: role.id })
      .save();

    return {
      value: dto.value,
      ...userRoleUpdate,
    };
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
    // remove a specific user role
    const deletedUserRole = await this.userRolesModel.delete({
      userId: Number(query.userId),
      roleId: role.id,
    });
    return deletedUserRole;
  }
}
