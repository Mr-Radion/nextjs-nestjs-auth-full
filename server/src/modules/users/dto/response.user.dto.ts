export class UserDto {
  firstName: string;
  lastName: string;
  email: string;
  id: string;
  roles: [string];
  isActivated: boolean;
  constructor(model) {
    this.firstName = model.firstName;
    this.lastName = model.lastName;
    this.email = model.email;
    this.id = model.id;
    this.roles = model.roles;
    this.isActivated = model.isActivated;
  }
}
