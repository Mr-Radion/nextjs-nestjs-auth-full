// export const FacebookButton = () => (
//   <div>
//     <button>{'facebook button'}</button>
//   </div>
// );

import clsx from 'clsx';
import Cookies from 'js-cookie';
// import { WhiteBlock } from '../../WhiteBlock';
// import { Button } from '../../Button';
// import { StepInfo } from '../../StepInfo';

import styles from './index.module.sass';
import React from 'react';

export const FacebookButton: React.FC = () => {
  const [codeSent, setCodeSent] = React.useState('');

  const onClickAuth = () => {
    window.open(
      'http://localhost:5000/api/auth/google',
      'Auth',
      'width=500,height=500,status=yes,toolbar=no,menubar=no,location=no',
    );
  };

  React.useEffect(() => {
    console.log('запуск');
    window.addEventListener('message', data => {
      const user: any = data;
      () => setCodeSent(user.data);
      // console.log(user.data);
      if (typeof user === 'string' && user.includes('googleId')) {
        Cookies.remove('token');
        const json: any = JSON.parse(user);
        Cookies.set('token', json.accessToken);
      }
      window.close();
    });
  }, [onClickAuth]);

  return (
    <div className={styles.block}>
      {/* <WhiteBlock className={clsx('m-auto mt-40', styles.whiteBlock)}> */}
      <button onClick={onClickAuth} className={clsx(styles.button, 'd-i-flex align-items-center')}>
        <img className="d-ib mr-10" src="/static/github.svg" />
        Import from Facebook
        <img className="d-ib ml-10" src="/static/arrow.svg" />
      </button>
      <div className="link mt-20 cup d-ib">Enter my info manually</div>
      {/* </WhiteBlock> */}
      <div>{codeSent}</div>
    </div>
  );
};
