import $api from '../../../lib/http';
import { AxiosResponse } from 'axios';
import { AuthResponse } from '../../../types';

export class AuthService {
  static async login(email: string, password: string) {
    return $api.post<AuthResponse>('/auth/login', { email, password });
    // const data = fetch('http://localhost:5000/api/auth/login', {
    //   method: 'Post',
    //   credentials: 'include',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json;charset=UTF-8',
    //   },
    //   body: JSON.stringify({ email, password }),
    // });
    // return data.then(response => response.json());
  }

  static async registration(email: string, password: string): Promise<AxiosResponse<AuthResponse>> {
    return $api.post<AuthResponse>('/users', { email, password });
  }

  static async logout(): Promise<void> {
    return $api.post('/auth/logout');
  }
}
