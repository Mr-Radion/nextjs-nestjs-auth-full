export class UserDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  id: string;
  facebookId: string;
  googleId: string;
  vkontakteId: string;
  odnoklassnikiId: string;
  mailruId: string;
  roles: [string];
  isActivated: boolean;
  constructor(model) {
    this.firstName = model.firstName;
    this.lastName = model.lastName;
    this.email = model.email;
    this.phone = model.phone;
    this.id = model.id;
    // model.facebookId ? (this.facebookId = model.facebookId) : '';
    // model.googleId ? (this.googleId = model.googleId) : '';
    this.facebookId = model.facebookId;
    this.googleId = model.googleId;
    this.vkontakteId = model.vkontakteId;
    this.odnoklassnikiId = model.odnoklassnikiId;
    this.mailruId = model.mailruId;
    this.roles = model.roles;
    this.isActivated = model.isActivated;
  }
}
