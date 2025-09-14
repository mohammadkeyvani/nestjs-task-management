import { Logger, Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

@Module({
  imports: [
    // TypeOrmModule.forRoot(typeOrmConfig),
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [
        () => {
          const env = process.env.NODE_ENV || 'default';
          const filePath = `config/${env}.yml`;
          const finalPath = fs.existsSync(filePath)
            ? filePath
            : 'config/default.yml';
          const configFile = fs.readFileSync(finalPath, 'utf-8');
          return yaml.load(configFile) as Record<string, any>;
        },
      ],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    TasksModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
