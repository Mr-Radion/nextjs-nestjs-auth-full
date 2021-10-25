import axios from 'axios';
// import { useRouter } from 'next/router';
import { AuthResponse } from '../types';
import Cookies from 'js-cookie';
import { isDevelopment } from '../environment';
// import { store } from '../../features/common/store';
import fingerprint from '../utils/fingerprint';

export const API_URL = isDevelopment ? `http://localhost:5000` : process.env.API_URL;

// 1 сначала отправляется option запрос, для проверки доступа по CORS, этот запрос по идее напрямую не связан с нашим js, а отправляется с браузера,
// если ответ удачный, например 204, при неудачном 403 придет
// 2 дальше запрос основной отправляется, вот тут мы уже обрабатываем результаты на клиенте: (разделить понятия на access и refresh)
// если 400 - такой токен в базе не найден и возвращается пустое значение, либо неправильный формат запроса (если причина этому access токен,
// то отправить на рефреш, если и рефреш выдал ту же ошибку, уже после совершить выход)
// если 401 - данный токен устарел или при правильном формате, но отсутствующий в базе,
// - отправляем на рефреш, при повторной ошибке выходить из аккаунта удаляя access
// если 403 - у вас нету доступа, либо cors не разрешает, либо роль не подходящая у пользователя
// - если дело в роли, то просто выводить, что нету доступа, никаких повторных запросов
// если 404 - маршрут неверный
// - выводим стр 404, не выкидываем пользователя и не удаляем токен
// если 405 -

// у нас будет отправляться предварительный OPTION запрос, вследствии использования заголовков ...
// more about cors https://developer.mozilla.org/ru/docs/Web/HTTP/CORS
const $api = axios.create({
  validateStatus: function (status) {
    return status == 200 || status == 201;
  },
  withCredentials: true, // чтобы к каждому запросу куки цеплялись автоматически
  baseURL: `${API_URL}/api`,
});

// при каждом запросе на сервер мы вытаскиваем текущий "access" токен сохраненный в куки и отправляем на сервер для аутенфикации
// access токен актуален всего 10 минут, поэтому это более безопасно, если комбинировать с одновременной проверкой refresh tokena через сессии
$api.interceptors.request.use(async config => {
  config.headers.Authorization = `Bearer ${Cookies.get('token-access')}`;
  config.headers.fingerprint = await fingerprint;
  // добавить заголовок с отпечатком браузера
  return config;
});

// при ответе от сервера со статусом ошибки 401, означающий, что access токен устарел
// мы отправляем дополнительный запрос для получения новой пары refresh и access токена с обновленным сроком жизни и сохраняем его в куках,
// потом снова повторяем исходный запрос, но уже с обновленным токеном
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
          headers: {
            fingerprint: await fingerprint,
          },
        });
        Cookies.remove('token-access');
        Cookies.set('token-access', response.data.user.accessToken);
        // к слову если не отправить данные внутри ответа от сервера, помимо неполучения токенов, на клиенте в интерцепторе не произойдет повторный запрос,
        // даже если статус ответа 200
        return $api.request(originalRequest);
      } catch (e) {
        console.log({ e });
        Cookies.remove('token-access');
        console.log('НЕ АВТОРИЗОВАН ИЛИ НЕПРАВИЛЬНЫЙ ФОРМАТ ACCESS ТОКЕНА!');
      }
    }
    throw error;
  },
);

export default $api;
