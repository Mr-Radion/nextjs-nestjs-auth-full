import { IUser, AuthResponse } from '../../../types';
import { makeAutoObservable } from 'mobx';
import { AuthService } from '../api';
import axios from 'axios';
import { API_URL } from '../../../http';
import Cookies from 'js-cookie';

export class AuthStore {
  user = {} as IUser;
  isAuth = false;
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  setAuth(bool: boolean) {
    this.isAuth = bool;
  }

  setUser(user: IUser) {
    this.user = user;
  }

  setLoading(bool: boolean) {
    this.isLoading = bool;
  }

  async login(email: string, password: string) {
    try {
      console.log('что-то началось!');
      const response = await AuthService.login(email, password);
      console.log({ response });
      Cookies.remove('token-access');
      Cookies.set('token-access', response.data.user.accessToken);
      this.setAuth(true);
      this.setUser(response.data.user.user);
    } catch (e) {
      console.log({ error: e });
      console.log(e.response?.data?.message);
    }
  }

  async registration(email: string, password: string) {
    try {
      const response = await AuthService.registration(email, password);
      console.log(response);
      Cookies.remove('token-access');
      Cookies.set('token-access', response.data.user.accessToken);
      this.setAuth(true);
      this.setUser(response.data.user.user);
    } catch (e) {
      console.log(e.response?.data?.message);
    }
  }

  async loginPhone(phone: string, channel: string) {
    try {
      const response = await AuthService.loginPhoneApi(phone, channel);
      console.log(response.data.status);
      // продолжение следует ...
    } catch (e) {
      console.log(e.response?.data?.message);
    }
  }

  async loginMail(email: string) {
    try {
      const response = await AuthService.loginMailApi(email);
      console.log(response.data.status);
      // продолжение следует ...
    } catch (e) {
      console.log(e.response?.data?.message);
    }
  }

  async verifyPhone(phone: string, otpCode: string) {
    try {
      const response = await AuthService.verifyPhoneApi(phone, otpCode);
      console.log({ responseVerifyPhone: response });
      Cookies.remove('token-access');
      Cookies.set('token-access', response.data.user.accessToken);
      this.setAuth(true);
      this.setUser(response.data.user.user);
    } catch (e) {
      console.log(e.response?.data?.message);
    }
  }

  async verifyMail(mail: string, otpCode: string) {
    try {
      const response = await AuthService.verifyMailApi(mail, otpCode);
      console.log({ responseVerifyPhone: response });
      Cookies.remove('token-access');
      Cookies.set('token-access', response.data.user.accessToken);
      this.setAuth(true);
      this.setUser(response.data.user.user);
    } catch (e) {
      console.log(e.response?.data?.message);
    }
  }

  async logout() {
    try {
      // const response = await AuthService.logout();
      await AuthService.logout();
      Cookies.remove('token-access');
      this.setAuth(false);
      this.setUser({} as IUser);
    } catch (e) {
      console.log(e.response?.data?.message);
    }
  }

  async checkAuth() {
    this.setLoading(true);
    try {
      const response = await axios.get<AuthResponse>(`${API_URL}/refresh`, {
        withCredentials: true,
      });
      console.log(response);
      Cookies.remove('token-access');
      Cookies.set('token-access', response.data.user.accessToken);
      this.setAuth(true);
      this.setUser(response.data.user.user);
    } catch (e) {
      console.log(e.response?.data?.message);
    } finally {
      this.setLoading(false);
    }
  }
}
