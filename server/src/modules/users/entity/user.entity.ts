import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
// import { v4 as uuidv4 } from 'uuid';
// import { Exclude, plainToClass } from 'class-transformer';
import { UserRolesEntity } from '../../roles/entity';
// import { ApiModelProperty } from '@nestjs/swagger';
// import { Position } from '../../modules/deals/entity/position.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
}

@Entity({
  name: 'users',
  // orderBy: {
  //   createdAt: 'ASC',
  // },
})
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', unique: true, nullable: true })
  nickname: string;

  @Column({ type: 'text', nullable: true })
  firstName: string;

  @Column({ type: 'text', nullable: true })
  lastName: string;

  @Column({ type: 'text', unique: true, nullable: true })
  email: string;

  // @Exclude()
  @Column({ nullable: true })
  password: string;

  // @ApiModelProperty({ description: 'The search location of the User' })
  // @Column()
  // searchIn: Position;

  @Column({ default: false })
  isActivated: boolean;

  @Column({ default: null })
  facebookId: string;

  @Column({ default: null })
  googleId: string;

  @Column({ default: null })
  vkontakteId: string;

  @Column({ default: null })
  mailruId: string;

  @Column({ default: null })
  odnoklassnikiId: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: null })
  gender: string;

  @Column({ nullable: true })
  activationLink: string;

  @Column({ default: false })
  banned: boolean;

  @Column({ nullable: true })
  banReason: string;

  @CreateDateColumn({
    name: 'creation_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  public updated_at: Date;

  // @CreateDateColumn({
  //   name: 'creation_at',
  //   type: 'timestamptz',
  //   default: () => 'CURRENT_TIMESTAMP',
  // })
  // creationAt: Date;

  // @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  // updatedAt: Date;

  // @ManyToOne(() => UserEntity, (user: UserEntity) => user.posts)

  @OneToMany(() => UserRolesEntity, (userRolesEntity: UserRolesEntity) => userRolesEntity.user)
  public userRolesEntity!: UserRolesEntity[];

  // @Column({ nullable: true })
  // public roles: string;

  // constructor(partial: Partial<UserEntity>) {
  //   super();
  //   if (partial) {
  //     Object.assign(this, partial);
  //     default values
  //     this.id = this.id || uuidv4();
  //   }
  // }
}
