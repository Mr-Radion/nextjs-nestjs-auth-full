import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { UserEntity } from '../users/entity';
import { RefreshTokenSessionsEntity } from './entity';
import { RoleEntity, UserRolesEntity } from '../roles/entity';
import {
  FacebookStrategy,
  GoogleStrategy,
  VkontakteStrategy,
  OdnoklassnikiStrategy,
  LocalStrategy,
} from './strategies';
import { RoleService } from '../roles/roles.service';
import { MailService } from '../mail/mail.service';
// import { PassportModule } from '@nestjs/passport';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    FacebookStrategy,
    VkontakteStrategy,
    OdnoklassnikiStrategy,
    RoleService,
    MailService,
    LocalStrategy,
  ],
  imports: [
    forwardRef(() => UsersModule),
    // PassportModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'SERCRET',
      signOptions: {
        expiresIn: '30m',
      },
    }),
    TypeOrmModule.forFeature([RefreshTokenSessionsEntity, UserEntity, UserRolesEntity, RoleEntity]),
  ],
  exports: [
    AuthService,
    JwtModule,
    // LocalStrategy
  ],
})
export class AuthModule {}
