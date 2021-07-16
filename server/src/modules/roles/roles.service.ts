import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleEntity } from './entity/roles.entity';

@Injectable()
export class RoleService {
  constructor(@InjectRepository(RoleEntity) private readonly roleRepository: Repository<RoleEntity>) {}
  async createRole(dto: CreateRoleDto): Promise<RoleEntity> {
    const role = this.roleRepository.create(dto);
    return role;
  }
  async getRoleByValue(value: string): Promise<RoleEntity> {
    const role = await this.roleRepository.findOne({ value });
    return role;
  }
}
