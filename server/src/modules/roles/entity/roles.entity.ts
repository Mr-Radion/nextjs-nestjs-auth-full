// import { UserEntity } from 'src/modules/users/entity';
import { UserRolesEntity } from './';
import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  // ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
// import { v4 as uuidv4 } from 'uuid';

@Entity({
  name: 'roles',
  // orderBy: {
  //   createdAt: 'ASC',
  // },
})
export class Roles extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  public id: number;

  @Column({ type: 'text', unique: true })
  value: string;

  @Column()
  description: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  public created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  public updated_at: Date;

  @OneToMany(() => UserRolesEntity, (userRolesEntity: UserRolesEntity) => userRolesEntity.role)
  public userRolesEntity!: UserRolesEntity[];

  // @ManyToMany(type => UserEntity, {
  //   cascade: true, // using cascades to automatically save related objects
  // })
  // @JoinTable()
  // public users: UserEntity[];
}
