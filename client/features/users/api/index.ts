import $api from '../../../http';
import { AxiosResponse } from 'axios';
import { IUser } from '../../../types';

export class UserService {
  static fetchProfile(): Promise<AxiosResponse<IUser>> {
    return $api.get<IUser>('/users/getMe');
    // return $api.post<IUser>('/users/ban/3');
  }
  static fetchUsers(): Promise<AxiosResponse<IUser[]>> {
    return $api.get<IUser[]>('/users');
  }
}
