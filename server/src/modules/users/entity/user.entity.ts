import { Entity, ObjectIdColumn, Column, ManyToMany, BaseEntity, JoinTable, PrimaryGeneratedColumn } from 'typeorm';
// import { v4 as uuidv4 } from 'uuid';
import { Exclude, plainToClass } from 'class-transformer';
import { RoleEntity, UserRolesEntity } from '../../roles/entity';
// import { ApiModelProperty } from '@nestjs/swagger';
// import { Position } from '../../modules/deals/entity/position.entity';

@Entity({
  name: 'users',
  orderBy: {
    createdAt: 'ASC',
  },
})
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column() // объект в postgres не поддерживается
  // userName: { nickname: string; firstName: string; lastName: string };

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  // @ApiModelProperty({ description: 'The search location of the User' })
  // @Column()
  // searchIn: Position;

  @Column()
  isActivated: boolean;

  @Column()
  activationLink: string;

  @Column()
  banned: boolean;

  @Column()
  banReason: string;

  // @ManyToMany(type => RoleEntity, UserRolesEntity => UserRolesEntity._id)
  // roles: RoleEntity[];

  @ManyToMany(() => RoleEntity)
  @JoinTable()
  roles: RoleEntity[];

  @Column()
  createdAt: number;

  @Column()
  updatedAt: number;

  constructor(partial: Partial<UserEntity>) {
    super();
    if (partial) {
      Object.assign(this, partial);
      // default values
      // this.id = this.id || uuidv4();
      this.isActivated = this.isActivated || false;
      this.createdAt = this.createdAt || +new Date();
      this.updatedAt = +new Date();
    }
  }
}
