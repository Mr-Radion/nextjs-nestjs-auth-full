import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  //   JoinTable,
  // OneToOne,
  //   ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';
// import { v4 as uuidv4 } from 'uuid';
// import { UserEntity } from 'src/modules/users/entity';

@Entity({
  name: 'otp',
})
export class OTPEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  //   @ManyToOne(() => UserEntity, (userEntity: UserEntity) => userEntity.id)
  //   @JoinTable({ name: 'userId' })
  //   user: UserEntity;

  @Column({ type: 'text', unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  code: string;

  @Column({ nullable: true, unique: true })
  fingerprint: string;

  @Column()
  expiresIn: number;

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
