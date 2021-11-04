import { useRouter } from 'next/router';
import React from 'react';
import $api from '../../../http';

export default function ResetPassword() {
  const { query } = useRouter();
  const [response, setResponse] = React.useState<string>('');

  React.useEffect(() => {
    $api
      .post<any>('/auth/changeresetlink', {
        email: query?.email,
        link: query?.link,
      })
      .then(res => setResponse(res.data.results))
      .catch(error => console.log(error));
  }, [query]);

  console.log({ query });
  console.log({ link: query.link });

  return query && query.link ? (
    response ? (
      <div>
        <h2>Изменение пароля</h2>
        <p>
          Для завершения процедуры и восстановления доступа, пожалуйста, укажите пароль к аккаунту:
        </p>
        <input type="text" placeholder="введите новый пароль" />
        <input type="text" placeholder="еще раз" />
      </div>
    ) : (
      <div>
        <h2>Изменение пароля</h2>
        <p>
          Код для восстановления пароля не найден или устарел. Возможно вы уже изменили пароль, если
          нет - повторите процедуру восстановления доступа еще раз
        </p>
      </div>
    )
  ) : (
    <div>
      <h2>Изменение пароля</h2>
      <p>
        Нет параметров для восстановления. Перейдите еще раз по ссылке из письма или скопируйте ее в
        адресную строку браузера или повторите процедуру восстановления доступа со страницы
        {`${process.env.CLIENT_URL}/join/forgotpwd`}
      </p>
    </div>
  );
}
