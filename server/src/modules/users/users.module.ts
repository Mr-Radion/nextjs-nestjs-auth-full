import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RolesModule } from '../roles/roles.module';
import { UserRolesEntity } from '../roles/entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MailModule } from '../mail/mail.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity';
import { RefreshTokenSessionsEntity } from '../auth/entity';
import { FileModule } from '../file/file.module';
// import { Roles } from '../roles/entity/roles.entity';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserRolesEntity,
      RefreshTokenSessionsEntity,
      // Roles  // if ManyToMany cascade relation
    ]),
    RolesModule,
    forwardRef(() => AuthModule),
    MailModule,
    FileModule,
  ],
  exports: [UsersService],
})
export class UsersModule {}
