export class UserDto {
  firstName: string;
  lastName: string;
  email: string;
  id: string;
  facebookId: string;
  googleId: string;
  roles: [string];
  isActivated: boolean;
  constructor(model) {
    this.firstName = model.firstName;
    this.lastName = model.lastName;
    this.email = model.email;
    this.id = model.id;
    // model.facebookId ? (this.facebookId = model.facebookId) : '';
    // model.googleId ? (this.googleId = model.googleId) : '';
    this.facebookId = model.facebookId;
    this.googleId = model.googleId;
    this.roles = model.roles;
    this.isActivated = model.isActivated;
  }
}
