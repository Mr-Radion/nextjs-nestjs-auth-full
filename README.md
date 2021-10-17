# Full auth app

- access and refresh tokens;
- session jwt + postgres and session id + redis;
- social network, local and jwt auth passport strategy;
- axios token interseptor;
- ssr nextjs token strategy;
- swagger api;

## Getting Started

### Frontend

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

### Backend

```bash
npm run start:dev
# or
yarn start:dev
```

Api is located at [http://localhost:5000](http://localhost:5000).

Features of the token preservation strategy

- at each login, registration and authentication, a pair of tokens is generated, we save the access token in the client cookie and the refresh token in the server cookie;
- for each browser, including different browser accounts, its own refresh token, which is stored in the database and server cookies, allows you to simultaneously log in from different browsers and devices without automatically all leaving user account other browsers;
- if the user deletes cookies, at the next login, the browser fingerprint and userid will still remain the same, respectively, the existing refresh token will be updated in the database based on them;
- полное удаление записи токена из базы происходит, в случае выхода или при запросе с устаревшим рефреш токеном, соответственно база не мусорится
  лишними и устаревшими токенами
- после устаревания access токена, при обычном запросе со статусом 401, фронт должен отправить запрос для обновления токенов,
  на auth/refresh, если результат положительный фронт продолжает свою работу, иначе выкидываем из приложения на фронте удаляя access токен из кук, если обычный запрос выдаст статус 400, вместо 401, то мы сразу чистим куки и выкидываем из приложения с фронта без запроса на auth/refresh, если не пользоваться приложением 60 дней, устареет и рефреш токен, тогда при запросе он удаляется из базы и выкидывает из приложения;
- если пользователь зарегистрировался или вошел через соц сеть, то после аутенфикации у провайдера, мы отправляем запрос на маршрут /auth/find_token с отпечатком браузера в заголовке в наше приложение, вместе с userId и socId в теле запроса, для генерации пары токенов в нашем приложении.
