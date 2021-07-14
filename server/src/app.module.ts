import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormService } from './config';
// import { UsersModule } from './modules/users/users.module';
// import { RolesModule } from './modules/roles/roles.module';
// import { MailModule } from './modules/mail/mail.module';

@Module({
  controllers: [],
  providers: [],
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeormService,
    }),
    // TypeOrmModule.forRootAsync({
    //   useFactory: () => ({
    //     uri: `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${
    //       process.env.MONGO_HOST
    //     }:${Number(process.env.MONGO_PORT1)},${process.env.MONGO_HOST}:${Number(
    //       process.env.MONGO_PORT2,
    //     )},${process.env.MONGO_HOST}:${Number(process.env.MONGO_PORT3)}/${
    //       process.env.MONGO_DATABASE
    //     }?replicaSet=${process.env.MONGO_REP_NAME}&connectTimeoutMS=300000&authSource=${
    //       process.env.MONGO_DATABASE
    //     }`,
    //     useCreateIndex: true,
    //     useNewUrlParser: true,
    //     useFindAndModify: false,
    //   }),
    // }),
    // UsersModule,
    // RolesModule,
    // MailModule,
  ],
})
export class AppModule {}
