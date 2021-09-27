import { IUser } from '.';

export interface AuthResponse {
  message: string;
  statusCode: number;
  user: {
    accessToken: string;
    user: IUser;
    refreshToken?: string;
  };
}
