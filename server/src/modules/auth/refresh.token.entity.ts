import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { UserEntity } from '../users/user.entity';

@Entity({
  name: 'tokens',
  orderBy: {
    createdAt: 'ASC',
  },
})

export class RefreshTokenSessionsEntity {
  // @PrimaryGeneratedColumn()
  // @PrimaryGeneratedColumn("uuid")
  // id: number;

  @ObjectIdColumn()
  _id: string;

  @Column()
  userId: UserEntity;

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
      this._id = this._id || uuidv4();
      this.createdAt = this.createdAt || +new Date();
      this.updatedAt = +new Date();
    }
  }
}
