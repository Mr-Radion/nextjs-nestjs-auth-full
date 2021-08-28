import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { RoleEntity } from './';
import { UserEntity } from 'src/modules/users/entity';
// import { v4 as uuidv4 } from 'uuid';

@Entity({
  name: 'user-roles',
  // orderBy: {
  //   createdAt: 'ASC',
  // },
})
export class UserRolesEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column()
  public roleId: number;

  @Column()
  public userId: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  public created_at?: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  public updated_at?: Date;

  @ManyToOne(() => RoleEntity, role => role.userRolesEntity)
  @JoinColumn({ name: 'roleId' })
  public role?: RoleEntity;

  @ManyToOne(() => UserEntity, user => user.userRolesEntity)
  @JoinColumn({ name: 'userId' })
  public user?: UserEntity;

  // constructor(partial: Partial<UserRolesEntity>) {
  //   if (partial) {
  //     Object.assign(this, partial);
  //     // this.id = this.id || uuidv4();
  //     this.createdAt = this.createdAt || +new Date();
  //     this.updatedAt = +new Date();
  //   }
  // }
}
