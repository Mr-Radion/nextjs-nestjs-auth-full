import React, { FC, useContext, useState } from 'react';
import Link from 'next/link';
import { Button, Divider, TextField, Box } from '@material-ui/core';
import { Context } from '../../../common/store';
import { observer } from 'mobx-react-lite';
import { FacebookButton } from '../facebook-login';
import { GoogleButton } from '../google-login';

export const LoginForm: FC = observer(() => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [mail, setMail] = useState<string>('');
  const [otpCode, setOTPCode] = useState<string>('');
  const { store } = useContext(Context);

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        '& > :not(style)': {
          m: 1,
          width: 500,
          height: 500,
        },
      }}
    >
      <GoogleButton />
      <FacebookButton />
      <form>
        <h3>Верификация через мобильный телефон или почту</h3>
        <TextField
          onChange={e => setPhone(e.target.value)}
          value={phone}
          className="mb-20"
          size="small"
          label="Введите номер телефона"
          variant="outlined"
          fullWidth
          required
        />
        <TextField
          onChange={e => setMail(e.target.value)}
          value={mail}
          className="mb-20"
          size="small"
          label="Введите адрес электронной почты"
          variant="outlined"
          fullWidth
          required
        />
        <Button color="primary" variant="contained" onClick={() => store.loginPhone(phone, 'sms')}>
          Отправить код на телефон
        </Button>
        <Button color="primary" variant="contained" onClick={() => store.loginMail(mail)}>
          Отправить код на почту
        </Button>

        <TextField
          onChange={e => setOTPCode(e.target.value)}
          value={otpCode}
          className="mb-20"
          size="small"
          label="Введите полученный одноразовый код доступа"
          variant="outlined"
          fullWidth
          required
        />
        <Button
          color="primary"
          variant="contained"
          onClick={() => store.verifyPhone(phone, otpCode)}
        >
          Войти через телефон
        </Button>
        <Button color="primary" variant="contained" onClick={() => store.verifyMail(mail, otpCode)}>
          Войти через почту
        </Button>
      </form>
      <form>
        {/* <input
          onChange={e => setEmail(e.target.value)}
          value={email}
          type="text"
          placeholder="Email"
        /> */}
        <TextField
          onChange={e => setEmail(e.target.value)}
          value={email}
          className="mb-20"
          size="small"
          label="Эл. почта"
          variant="outlined"
          fullWidth
          required
        />
        <TextField
          onChange={e => setPassword(e.target.value)}
          value={password}
          type="password"
          size="small"
          label="Пароль"
          variant="outlined"
          fullWidth
          required
        />
        <Divider className="mt-30 mb-20" />
        {/* <input
          onChange={e => setPassword(e.target.value)}
          value={password}
          type="password"
          placeholder="Пароль"
        /> */}
        <Button color="primary" variant="contained" onClick={() => store.login(email, password)}>
          Логин
        </Button>
        <Button
          color="primary"
          variant="contained"
          onClick={() => store.registration(email, password)}
        >
          Регистрация
        </Button>
      </form>
      <Link href="/join/forgotpwd">
        <a>Забыли пароль?</a>
      </Link>
    </Box>
  );
});
