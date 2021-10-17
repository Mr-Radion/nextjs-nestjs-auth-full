import Cookies from 'js-cookie';
import React from 'react';

export default function PageNotFound() {
  const [token, setToken] = React.useState<string>('');

  React.useEffect(() => {
    setToken(Cookies.get('token-access'));
  }, [token]);

  return (
    <div>
      <h2>404</h2>
      {token ? (
        <div>Меню активное авторизованного пользователя</div>
      ) : (
        <div>Меню неавторизованного пользователя</div>
      )}
    </div>
  );
}
