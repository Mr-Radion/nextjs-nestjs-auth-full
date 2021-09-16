import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinTable,
  OneToOne,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';
// import { v4 as uuidv4 } from 'uuid';
import { UserEntity } from 'src/modules/users/entity';

@Entity({
  name: 'tokens',
  orderBy: {
    createdAt: 'ASC',
  },
})
export class RefreshTokenSessionsEntity extends BaseEntity {
  // @ObjectIdColumn()
  // _id: string;

  // @PrimaryGeneratedColumn("uuid")
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (userEntity: UserEntity) => userEntity.id)
  @JoinTable({ name: 'userId' })
  user: UserEntity;

  // @ManyToOne(() => UserEntity)
  // @JoinTable()
  // user: UserEntity;

  @Column({ nullable: false })
  refreshToken: string;

  @Column({ nullable: true })
  ip: string;

  // @Column()
  // expiresIn: string;

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
}
