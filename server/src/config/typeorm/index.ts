import { Injectable, Logger } from '@nestjs/common';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getMetadataArgsStorage, createConnection } from 'typeorm';

import config from '../../config.orm';
// import { logger } from '../../common'

@Injectable()
export class TypeormService implements TypeOrmOptionsFactory {
  async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
    console.log(...config);
    const options = {
      ...config,
      type: 'postgres',
      // entities: getMetadataArgsStorage().tables.map(tbl => tbl.target),
      entities: [__dirname + '../../modules/**/*.entity{.ts,.js}'],
      // migrations: ['src/modules/**/migration/*.ts'],
      // subscribers: ['src/modules/**/subscriber/*.ts'],
      // cli: {
      // 	entitiesDir: 'src/modules/**/entity',
      // 	migrationsDir: 'src/modules/**/migration',
      // 	subscribersDir: 'src/modules/**/subscriber'
      // },
      synchronize: true,
      useUnifiedTopology: true,
      autoLoadEntities: true, // entities will be loaded automatically
      keepConnectionAlive: true,
      retryDelay: 3000, // Delay between connection retry attempts (ms) (default: 3000)
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
