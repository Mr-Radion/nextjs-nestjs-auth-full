import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
// import { v4 as uuidv4 } from 'uuid';

@Entity({
  name: 'user-roles',
  orderBy: {
    createdAt: 'ASC',
  },
})
export class UserRolesEntity {
  @PrimaryGeneratedColumn()
  id: number;

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
      // this.id = this.id || uuidv4();
      this.createdAt = this.createdAt || +new Date();
      this.updatedAt = +new Date();
    }
  }
}
