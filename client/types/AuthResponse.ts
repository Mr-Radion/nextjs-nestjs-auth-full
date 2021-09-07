import { IUser } from '.';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}
