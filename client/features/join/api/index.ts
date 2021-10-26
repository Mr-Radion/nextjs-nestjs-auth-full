import $api from '../../../http';
import { AxiosResponse } from 'axios';
import { AuthResponse, AuthVerifyPhoneResponse } from '../../../types';
// import fingerprint from '../../../utils/fingerprint';

export class AuthService {
  static async login(email: string, password: string) {
    return $api.post<AuthResponse>('/auth/login', {
      email,
      password,
      // fingerprint: await fingerprint,
    });

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

  static async loginPhoneApi(phone: string, channel: string): Promise<AxiosResponse<any>> {
    return $api.get<any>(`/auth/login/phone?phonenumber=${phone}&channel=${channel}`);
  }

  static async verifyPhoneApi(
    phone: string,
    otpCode: string,
  ): Promise<AxiosResponse<AuthVerifyPhoneResponse>> {
    return $api.get<AuthVerifyPhoneResponse>(
      `/auth/verify/phone?phonenumber=${phone}&code=${otpCode}`,
    );
  }

  static async loginMailApi(email: string): Promise<AxiosResponse<any>> {
    return $api.post<any>('/auth/login/mail', {
      email,
    });
  }

  static async verifyMailApi(
    mail: string,
    otpCode: string,
  ): Promise<AxiosResponse<AuthVerifyPhoneResponse>> {
    return $api.post<AuthVerifyPhoneResponse>('/auth/verify/mail', {
      email: mail,
      code: otpCode,
    });
  }

  static async logout(): Promise<void> {
    return $api.post('/auth/logout');
  }
}
