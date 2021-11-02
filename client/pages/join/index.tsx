// import styles from '../styles/Home.module.css'
import Cookies from 'js-cookie';
import React from 'react';
import PageNotFound from '../404';
import { MainLayot } from '../../features/common/components';
import {
  LoginForm,
  // FacebookButtonReact
} from '../../features/join';
import { useRouter } from 'next/router';

export default function Join() {
  const router = useRouter();
  const [token, setToken] = React.useState<string>('');

  React.useEffect(() => {
    if (Cookies.get('token-access')) {
      setToken(Cookies.get('token-access'));
      router.push({ pathname: '/' });
    }
    // if (token) router.push({ pathname: '/' });
  }, [token]);

  if (token) {
    return <PageNotFound />;
  }
  return (
    <MainLayot>
      <LoginForm />
      {/* <FacebookButtonReact /> */} {/* serverless authentication option */}
    </MainLayot>
  );
}
