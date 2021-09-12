import axios from 'axios';
import { AuthResponse } from '../../types';
// import { store } from '../../features/common/store';

export const API_URL = `http://localhost:5000/api`;

const $api = axios.create({
  withCredentials: true,  // чтобы к каждому запросу куки цеплялись автоматически
  baseURL: API_URL,
});

// при каждом запросе на сервер мы вытаскиваем текущий access токен сохраненный в куки и отправляем на сервер для аутенфикации
$api.interceptors.request.use(config => {
  // config.withCredentials = true;
  config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  return config;
});

// при ответе от сервера со статусом ошибки 401, означающий, что access токен устарен
// мы отправляем дополнительный запрос для получения новой пары refresh и access токена с обновленным сроком жизни и сохраняем его в куках
// снова повторяем исходный запрос, но уже с обновленным токеном
$api.interceptors.response.use(
  config => {
    return config;
  },
  async error => {
    const originalRequest = error.config;
    if (error.response.status == 401 && error.config && !error.config._isRetry) {
      originalRequest._isRetry = true;
      try {
        const response = await axios.get<AuthResponse>(`${API_URL}/auth/refresh`, {
          withCredentials: true,
        });
        localStorage.setItem('token', response.data.accessToken);
        return $api.request(originalRequest);
      } catch (e) {
        console.log('НЕ АВТОРИЗОВАН');
      }
    }
    throw error;
  },
);

export default $api;
