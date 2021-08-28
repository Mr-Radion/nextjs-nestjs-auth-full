import { Entity, Column, PrimaryGeneratedColumn, JoinTable, ManyToOne } from 'typeorm';
// import { v4 as uuidv4 } from 'uuid';
import { UserEntity } from 'src/modules/users/entity';

@Entity({
  name: 'tokens',
  orderBy: {
    createdAt: 'ASC',
  },
})

export class RefreshTokenSessionsEntity {
  // @ObjectIdColumn()
  // _id: string;

  // @PrimaryGeneratedColumn("uuid")
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity)
  @JoinTable()
  user: UserEntity;

  @Column()
  refreshToken: string;

  @Column()
  ip: string;
  
  @Column()
  expiresIn: string;

  @Column()
  createdAt: number;

  @Column()
  updatedAt: number;

  constructor(partial: Partial<RefreshTokenSessionsEntity>) {
    if (partial) {
      Object.assign(this, partial);
      // this.id = this.id || uuidv4();
      this.createdAt = this.createdAt || +new Date();
      this.updatedAt = +new Date();
    }
  }
}
