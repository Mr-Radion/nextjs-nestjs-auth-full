import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleEntity as Roles } from './entity';

@Injectable()
export class RoleService {
  constructor(@InjectRepository(Roles) private readonly roleRepository: Repository<Roles>) {}
  async createRole(dto: CreateRoleDto): Promise<Roles> {
    const role = this.roleRepository.save(dto);
    return role;
  }
  async getRoleByValue(value: string) {
    const role = await this.roleRepository.findOne({ value });
    console.log(role, 17);
    return role;
  }
}
