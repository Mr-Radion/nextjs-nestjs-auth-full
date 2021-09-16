export class UserDto {
  email: string;
  id: string;
  roles: [string];
  isActivated: boolean;
  constructor(model) {
    this.email = model.email;
    this.id = model.id;
    this.roles = model.roles;
    this.isActivated = model.isActivated;
  }
}
