import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

import { VehicleModule } from './modules/vehicle/vehicle.module';
import { ParseXmlService } from './common/services/parse-xml.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Load environment variables globally
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('DATABASE_URL') ||
          'mongodb://mongo:27017/vehicle',
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize:
          parseInt(configService.get<string>('DATABASE_MAX_POOL_LIMIT')) || 50,
      }),
      inject: [ConfigService],
    }),
    VehicleModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'), // Auto-generate schema
      playground: true, // Enable GraphQL Playground
      introspection: true, // Enable schema introspection
    }),
  ],
  providers: [ParseXmlService],
})
export class AppModule {}
