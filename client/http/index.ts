import axios from 'axios';
import { AuthResponse } from '../types';
import Cookies from 'js-cookie';
// import { store } from '../../features/common/store';

export const API_URL =
  process.env.API_URL || process.env.NODE_ENV == 'development' ? `http://localhost:5000` : '';

const $api = axios.create({
  withCredentials: true, // чтобы к каждому запросу куки цеплялись автоматически
  baseURL: `${API_URL}/api`,
});

// при каждом запросе на сервер мы вытаскиваем текущий "access" токен сохраненный в куки и отправляем на сервер для аутенфикации
// access токен актуален всего 30 минут, поэтому это более безопасно, если комбинировать с одновременной проверкой refresh tokena через сессии
$api.interceptors.request.use(config => {
  // config.withCredentials = true;
  config.headers.Authorization = `Bearer ${Cookies.get('token-access')}`;
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
        const response = await axios.get<AuthResponse>(`${API_URL}/api/auth/refresh`, {
          withCredentials: true,
        });
        Cookies.set('token-access', response.data.user.accessToken, {
          expires: 1 / 24 / 2, // 30 min
        });
        return $api.request(originalRequest);
      } catch (e) {
        console.log('НЕ АВТОРИЗОВАН');
      }
    }
    throw error;
  },
);

export default $api;
