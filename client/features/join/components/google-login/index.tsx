// import clsx from 'clsx';
import Cookies from 'js-cookie';
import { Button } from '@material-ui/core';
import styles from './index.module.sass';
import React from 'react';
import $api, { API_URL } from '../../../../http';
import { useRouter } from 'next/router';
import { AuthResponse } from '../../../../types';

export const GoogleButton: React.FC = React.memo(({}) => {
  const router = useRouter();
  const [codeSent, setCodeSent] = React.useState<AuthResponse>();

  const onClickAuth = () => {
    try {
      window.open(
        `${API_URL}/api/auth/google`,
        'Auth', // window.name - если позднее вызвать window.open() с тем же именем, то браузеры (кроме IE) заменяют существующее окно на новое.
        'width=500,height=500,status=yes,toolbar=no,menubar=no,location=no', // window.params
      );
      if (typeof window !== 'undefined') {
        window.addEventListener('message', e => {
          if (e.origin !== API_URL) return;
          const userData: any = JSON.parse(e.data);
          if (userData && userData.googleId) {
            // отправляем запрос пользователю с отпечатком браузера для обновления рефреш токена
            console.log({ userData });
            console.log('прошло условие 1!');
            const data = $api.post('/auth/find_token', {
              userId: userData.id,
              googleId: userData.googleId,
            });

            if (data) {
              // Перезаписываем куки и добавляем данные пользователя в состояние
              console.log({ data });
              Cookies.remove('token-access');
              data.then(res => {
                console.log({ res });
                setCodeSent(res.data.user.user);
                Cookies.set('token-access', res.data.user.accessToken);
              });
            }
          } else {
            console.log('access token или googleId отсутствуют');
          }
          return;
        });
      }
    } catch (error) {
      console.log('onClickAuth', error.message);
    }
  };

  React.useEffect(() => {
    if (codeSent) router.push({ pathname: '/' });
  }, [codeSent]);

  console.log(codeSent);

  return (
    <div className={styles.block}>
      <Button color="primary" variant="contained" onClick={onClickAuth}>
        Google
      </Button>
      {/* <div>{codeSent}</div> */}
      {/* <iframe src="http://localhost:5000/api/auth/google" frameBorder="0"></iframe> */}
    </div>
  );
});
