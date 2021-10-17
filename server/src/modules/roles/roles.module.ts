import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleService } from './roles.service';
import { RolesController } from './roles.controller';
import { RoleEntity, UserRolesEntity } from './entity';
import { UserEntity } from 'src/modules/users/entity';

@Module({
  providers: [RoleService],
  controllers: [RolesController],
  imports: [TypeOrmModule.forFeature([RoleEntity, UserRolesEntity, UserEntity])],
  exports: [RoleService],
})
export class RolesModule {}
