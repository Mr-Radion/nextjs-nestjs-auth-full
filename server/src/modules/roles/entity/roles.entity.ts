import { Entity, ObjectIdColumn, Column, BaseEntity } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity({
  name: 'roles',
  orderBy: {
    createdAt: 'ASC',
  },
})

export class RoleEntity extends BaseEntity {
  @ObjectIdColumn()
  _id: string;

  @Column()
  value: string;

  @Column()
  description: string;

  @Column()
  createdAt: number;

  @Column()
  updatedAt: number;

  constructor(partial: Partial<RoleEntity>) {
    super();
    if (partial) {
      Object.assign(this, partial);
      this._id = this._id || uuidv4();
      this.createdAt = this.createdAt || +new Date();
      this.updatedAt = +new Date();
    }
  }
}
