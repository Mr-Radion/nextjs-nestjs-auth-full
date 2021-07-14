import { Injectable, Logger } from '@nestjs/common';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getMetadataArgsStorage, createConnection } from 'typeorm';

import config from '../../config.orm';

@Injectable()
export class TypeormService implements TypeOrmOptionsFactory {
  async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
    const options = {
      ...config,
      type: 'mongodb',
      entities: getMetadataArgsStorage().tables.map(tbl => tbl.target),
      synchronize: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      keepConnectionAlive: true,
      logging: true,
    };
    createConnection(options)
      .then(data => {
        // logger.info(data)
        Logger.log(`☁️  Database connected`, 'TypeORM', false);
      })
      .catch(err => {
        // logger.error(err)
        Logger.error(`❌  Database connect error`, '', 'TypeORM', false);
      });

    return options;
  }
}
