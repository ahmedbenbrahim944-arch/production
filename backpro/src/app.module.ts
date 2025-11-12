// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { Admin } from './admin/entities/admin.entity';
import { User } from './user/entities/user.entity';
import { ProductModule } from './product/product.module';
import { SemaineModule } from './semaine/semaine.module';

@Module({
  imports: [
    // Configuration TypeORM directement ici
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3307,
      username: 'root', // Change selon ta config
      password: '', // Change selon ta config  
      database: 'production', // Change le nom de ta base
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // ⚠️ Mettre à false en production
      logging: true, // Pour voir les requêtes SQL
      autoLoadEntities: true,
    }),
    AdminModule,
    UserModule,
    AuthModule,
    ProductModule,
    SemaineModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
