import clsx from 'clsx';
// import Cookies from 'js-cookie';
import styles from './index.module.sass';
import React from 'react';
import { API_URL } from '../../../../lib/http';

export const FacebookButton: React.FC = () => {
  const [codeSent, setCodeSent] = React.useState({});

  const onClickAuth = () => {
    window.open(
      `${API_URL}/api/auth/facebook`,
      'Auth',
      'width=500,height=500,status=yes,toolbar=no,menubar=no,location=no',
    );
    if (typeof window !== 'undefined') {
      window.addEventListener('message', e => {
        if (e.origin !== API_URL) return;
        const userData: any = JSON.parse(e.data);
        if (userData) setCodeSent(userData);
        // if (userData.user.includes('facebookId')) {
        //   Cookies.remove('token');
        //   Cookies.set('token', userData.user.accessToken);
        // }
        return;
      });
    }
  };

  console.log(codeSent);

  return (
    <div className={styles.block}>
      <button onClick={onClickAuth} className={clsx(styles.button, 'd-i-flex align-items-center')}>
        Import from Facebook
      </button>
      <div className="link mt-20 cup d-ib">Enter my info manually</div>
      {/* <div>{codeSent}</div> */}
      {/* <iframe src="http://localhost:5000/api/auth/google" frameBorder="0"></iframe> */}
    </div>
  );
};
