# Full auth app

- access and refresh tokens;
- access levels by role;
- session id + redis;
- confirmation mail;
- social network, local and jwt auth passport strategy;
- verification via mobile with timer and code resending;
- changing and creating a new password;
- axios token interseptor;
- nextjs token strategy;
- swagger api;

## Getting Started

### Frontend running code

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

### Backend running code

```bash
npm run start:dev
# or
yarn start:dev
```

Api is located at [http://localhost:5000](http://localhost:5000).

### Features of the token preservation strategy

- at each login, registration and authentication, a pair of tokens is generated, we save the access token in the client cookie and the refresh token in the server cookie;
- for each browser, including different browser accounts, its own refresh token, which is stored in the database and server cookies, allows you to simultaneously log in from different browsers and devices without automatically all leaving user account other browsers;
- if the user deletes cookies, at the next login, the browser fingerprint and userid will still remain the same, respectively, the existing refresh token will be updated in the database based on them;
- complete deletion of the token record from the base occurs in case of exit or upon request with an outdated refresh token, respectively, the base is not littered with unnecessary and outdated tokens;
- after the access token expires, with a normal request with a 401 status, the front must send a request to update the tokens, to auth / refresh, if the result is positive, then the front continues its work, otherwise we throw it out of the application at the front, removing the access token from the cookie, if a normal request will give the status 400, instead of 401, then we immediately clear the cookies and throw them out of the application from the front, if you do not use the application for 60 days, the refresh token will also become outdated, then when requested, it is deleted from the database and thrown out of the application;
- if a user has registered or entered via a social network, then after authentication with the provider, we send a request for the /auth/find_token route with a browser fingerprint in the header to our application, along with userId and socId in the request body, to generate a pair of tokens in our application.
