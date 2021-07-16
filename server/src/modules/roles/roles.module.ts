import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleService } from './roles.service';
import { RolesController } from './roles.controller';
import { RoleEntity, UserRolesEntity } from './entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  providers: [RoleService],
  controllers: [RolesController],
  imports: [TypeOrmModule.forFeature([RoleEntity, UserRolesEntity]), AuthModule],
  exports: [RoleService],
})
export class RolesModule {}
