export interface Role {
  created_at: string;
  description: string;
  id: number;
  updated_at: string;
  value: string;
}

export interface IUser {
  activationLink: null;
  avatar: string | null;
  banReason: string | null;
  banned: boolean;
  created_at: string;
  email: string;
  facebookId: string | null;
  firstName: string | null;
  gender: string | null;
  googleId: string | null;
  id: number | null;
  isActivated: boolean;
  registered: boolean;
  lastName: string | null;
  mailruId: string | null;
  vkontakteId: string | null;
  nickname: string | null;
  odnoklassnikiId: string | null;
  phone: string | null;
  roles: Role[];
  password?: string | null;
  numberOfUniqueViews?: number | null;
}
