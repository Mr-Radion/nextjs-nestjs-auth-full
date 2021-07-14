import * as dotenv from 'dotenv';
dotenv.config();
const NODE_ENV: string = process.env.NODE_ENV || 'development';

// const dw = `.${process.env.NODE_ENV}.env`;

const orm = {
  // development: {
  //   url: `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${
  //     process.env.MONGO_HOST
  //   }:${Number(process.env.MONGO_PORT1)},${process.env.MONGO_HOST}:${Number(
  //     process.env.MONGO_PORT2,
  //   )},${process.env.MONGO_HOST}:${Number(process.env.MONGO_PORT3)}/${
  //     process.env.MONGO_DATABASE
  //   }?replicaSet=${process.env.MONGO_REP_NAME}&connectTimeoutMS=300000&authSource=${
  //     process.env.MONGO_DATABASE
  //   }`,
  // },
  development: {
    url: `mongodb://DbMan:gr$-=g5G45@localhost:${Number(27018)},localhost:${Number(
      27019,
    )},localhost:${Number(
      27020,
    )}/weekendDB?replicaSet=pastiera&connectTimeoutMS=300000&authSource=weekendDB`,
  },
  // testing: {
  //   url: `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${
  //     process.env.MONGO_HOST
  //   }:${Number(process.env.MONGO_PORT1)},${process.env.MONGO_HOST}:${Number(
  //     process.env.MONGO_PORT2,
  //   )},${process.env.MONGO_HOST}:${Number(process.env.MONGO_PORT3)}/${
  //     process.env.MONGO_DATABASE
  //   }?replicaSet=${process.env.MONGO_REP_NAME}&connectTimeoutMS=300000&authSource=${
  //     process.env.MONGO_DATABASE
  //   }`,
  // },
  // production: {
  //   url: `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${
  //     process.env.MONGO_HOST
  //   }:${Number(process.env.MONGO_PORT1)},${process.env.MONGO_HOST}:${Number(
  //     process.env.MONGO_PORT2,
  //   )},${process.env.MONGO_HOST}:${Number(process.env.MONGO_PORT3)}/${
  //     process.env.MONGO_DATABASE
  //   }?replicaSet=${process.env.MONGO_REP_NAME}&connectTimeoutMS=300000&authSource=${
  //     process.env.MONGO_DATABASE
  //   }`,
  // },
};

export default orm[NODE_ENV!];
