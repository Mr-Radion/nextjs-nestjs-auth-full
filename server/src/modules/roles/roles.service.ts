import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role, RoleDocument } from './schemas';

@Injectable()
export class RoleService {
  constructor(@InjectModel(Role.name) private roleRepository: Model<RoleDocument>) {}
  async createRole(dto: CreateRoleDto): Promise<Role> {
    const role = await this.roleRepository.create(dto);
    return role;
  }
  async getRoleByValue(value: string): Promise<Role> {
    const role = await this.roleRepository.findOne({ value }).lean();
    return role;
  }
}
