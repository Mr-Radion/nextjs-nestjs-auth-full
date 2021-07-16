import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity({
  name: 'user-roles',
  orderBy: {
    createdAt: 'ASC',
  },
})
export class UserRolesEntity {
  @ObjectIdColumn()
  _id: string;

  @Column()
  roleId: number;

  @Column()
  userId: number;

  @Column()
  createdAt: number;

  @Column()
  updatedAt: number;

  constructor(partial: Partial<UserRolesEntity>) {
    if (partial) {
      Object.assign(this, partial);
      this._id = this._id || uuidv4();
      this.createdAt = this.createdAt || +new Date();
      this.updatedAt = +new Date();
    }
  }
}
