import Cookies from 'js-cookie';
import { API_URL } from '../http';

export const onClickAuth = () => {
  window.open(
    `${API_URL}/api/auth/facebook`,
    'Auth', // window.name - если позднее вызвать window.open() с тем же именем, то браузеры (кроме IE) заменяют существующее окно на новое.
    'width=500,height=500,status=yes,toolbar=no,menubar=no,location=no', // window.params
  );
  if (typeof window !== 'undefined') {
    window.addEventListener('message', e => {
      if (e.origin !== API_URL) return;
      const userData: any = JSON.parse(e.data);
      if (userData) setCodeSent(userData);
      if (userData.user.accessToken && userData.user.user.facebookId) {
        Cookies.remove('token-access');
        Cookies.set('token-access', userData.user.accessToken, {
          expires: 1 / 24 / 2, // 30 min
        });
      } else {
        console.log('access token или facebookId отсутствуют');
      }
      return;
    });
  }
};
