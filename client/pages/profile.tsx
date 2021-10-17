import React from 'react';
import Cookies from 'js-cookie';
import { UserService } from '../features/users/api';
import { MainLayot } from '../features/common/components';
import { useRouter } from 'next/router';
// import axios from 'axios';
// import $api from '../http';

export default function Join() {
  const router = useRouter();
  const [userData, setUserData] = React.useState<any>([]);
  const [token, setToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    // const result = $api.get<any>('/users/getMe');
    const result = UserService.fetchProfile();
    // ОБРАБОТАТЬ ошибку 400, КОГДА ACCESS ТОКЕН ОТСУТСТВУЕТ ИЛИ НЕПРАВИЛЬНОГО ФОРМАТА, ЧТОБЫ УДАЛИТЬ ACCESS ТОКЕН И ВЫКИНУТЬ ИЗ ПРИЛОЖЕНИЯ
    result.then(setUserData).catch(error => {
      {
        console.log('profile page error', error.message);
      }
    });
    // console.log({ token });

    // getMe();
  }, []);

  // токен должен идти после запроса на его получение, иначе будет лишняя реакция на пустой токен
  React.useEffect(() => {
    if (Cookies.get('token-access')) {
      setToken(Cookies.get('token-access'));
    } else {
      router.push({ pathname: '/join' });
    }
  }, [token]);

  // async function getMe() {
  //   try {
  //     const response = await UserService.fetchProfile();
  //     // const response = await axios.get<any>('/users/getMe', {
  //     //   withCredentials: true,
  //     //   baseURL: `http://localhost:5000/api`,
  //     // });
  //     // result.then(setUserData).catch(error => console.log('profile page error', error.message));
  //     if (response.data) setUserData(response);
  //   } catch (e) {
  //     // logger
  //     console.log(e);
  //     // throw new Error('Function not implemented.');
  //   }
  // }
  userData.data ? console.log(userData.data) : 'нету ничего';
  // if (token) console.log({ token });
  // if (userData.data) console.log(userData.data);

  return (
    <MainLayot>
      <div>Мой профиль</div>
    </MainLayot>
  );
}
