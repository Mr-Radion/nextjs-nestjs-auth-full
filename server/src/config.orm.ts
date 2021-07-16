import * as dotenv from 'dotenv';
dotenv.config();
const NODE_ENV: string = process.env.NODE_ENV || 'development';

// const dw = `.${process.env.NODE_ENV}.env`;

const orm = {
  development: {
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'root',
    database: 'we',
  },
  testing: {
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'root',
    database: 'we',
  },
  // production: {
  //   host: 'localhost',
  //   port: 5432,
  //   username: 'postgres',
  //   password: '',
  //   database: 'we',
  // },
};

export default orm[NODE_ENV!];
