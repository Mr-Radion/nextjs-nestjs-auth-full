import React from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { MainLayot } from '../features/common/components';

export default function Home() {
  const [token, setToken] = React.useState<string>('');

  // React.useEffect(() => {
  //   // должен выполняться на каждой странице запрос для вызова данных при первом входе, чтобы токен обновлять сразу
  //   !token
  //     ?
  //       setToken(Cookies.get('token-access'))
  //     : '';
  // });

  React.useEffect(() => {
    // можно не ставить в зависимость токен, вместо этого делая редирект, чтобы если токен истек, он не менял сразу, дождавшись ререндера, где он обновится запросом
    setToken(Cookies.get('token-access'));
  }, [token]);

  return (
    <MainLayot>
      {!token ? (
        <div>
          <div>Главная</div>
          <Link href="/join">
            <a>Войти</a>
          </Link>
        </div>
      ) : (
        <div>
          <div>Личный кабинет</div>
          <div>
            <Link href="/profile">
              <a>Мой профиль</a>
            </Link>
          </div>
        </div>
      )}
    </MainLayot>
  );
}
