import clsx from 'clsx';
import Cookies from 'js-cookie';
import styles from './index.module.sass';
import React from 'react';
import { API_URL } from '../../../../http';
import { useRouter } from 'next/router';
import { AuthResponse } from '../../../../types';

export const FacebookButton: React.FC = ({}) => {
  const router = useRouter();
  const [codeSent, setCodeSent] = React.useState<AuthResponse>();

  const onClickAuth = () => {
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

  React.useEffect(() => {
    if (codeSent) router.push({ pathname: '/' });
  }, [codeSent]);

  console.log(codeSent);

  return (
    <div className={styles.block}>
      <button onClick={onClickAuth} className={clsx(styles.button, 'd-i-flex align-items-center')}>
        Import from Facebook
      </button>
      {/* <div>{codeSent}</div> */}
      {/* <iframe src="http://localhost:5000/api/auth/google" frameBorder="0"></iframe> */}
    </div>
  );
};
