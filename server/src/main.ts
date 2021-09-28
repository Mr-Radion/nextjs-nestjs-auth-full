import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as session from 'express-session';
import * as Store from 'connect-redis';
// import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { redis } from './redis';

async function bootstrap() {
  try {
    const RedisStore = Store(session);
    const PORT = process.env.PORT || 5000;
    // const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    //   // httpsOptions,
    //   transport: Transport.REDIS, //setting transporter
    //   options: {
    //     url: 'redis://localhost:6379',
    //   },
    // });
    const app = await NestFactory.create(AppModule, {
      cors: {
        credentials: true,
        origin: process.env.CLIENT_URL,
      },
    });
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.use(
      session({
        // For this store to work, you need to connect service Redis to the OS, default port is: 6379, for ubuntu 20 sudo systemctl restart redis-server
        store: new RedisStore({
          client: redis as any,
        }),
        secret: process.env.SESSION_ID_SECRET,
        name: 'sid', // defaults to 'connect.sid'.
        resave: false, // we will not save to the database if the session data has not changed
        saveUninitialized: false, // otherwise, all sessions will be recorded in a row, regardless of whether the user is logged in
        cookie: {
          // true is the restriction of access in the browser from the js document
          httpOnly: true,
          /* 
            SameSite attribute in Set-Cookie header. Controls how cookies are sent
            with cross-site requests. Used to mitigate CSRF. Possible values are
            'strict' (or true), 'lax', and false (to NOT set SameSite attribute).
            It only works in newer browsers, so CSRF prevention is still a concern. 
          */
          sameSite: true,
          // true is https
          secure: process.env.NODE_ENV === 'production',
          // due date
          // expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
          /* 
            Specifies the number (in milliseconds) to use when calculating the `Expires Set-Cookie` attribute.
            * This is done by taking the current server time and adding `maxAge` milliseconds to the value 
            to calculate an `Expires` datetime. By default, no maximum age is set. 
          */
          maxAge: 1000 * 60 * 60 * 24 * 365, // lifespan year unix-time in seconds
        },
      }),
    );
    const config = new DocumentBuilder()
      .setTitle('API')
      .setVersion('1.0.0')
      .setExternalDoc('For more information', 'http://swagger.io')
      .build(); // openapi info
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api/docs', app, document);
    await app.listen(PORT, () => console.log(`Server started on port - ${PORT}`));
  } catch (error) {
    console.log(error);
  }
}
bootstrap();
