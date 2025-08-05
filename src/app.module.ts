import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './config/database.config';
import { User } from './entities/user.entity';
import { UserSubscriber } from './entities/subscribers/user.subscriber';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfileModule } from './profile/profile.module';
import { PacientesModule } from './pacientes/pacientes.module';
import { AgendaSessoesModule } from './agenda-sessoes/agenda-sessoes.module';
import { PacotesModule } from './pacotes/pacotes.module';
import { PagamentosModule } from './pagamentos/pagamentos.module';
import { ProntuariosModule } from './prontuarios/prontuarios.module';

@Module({
  imports: [
    // Configuração de variáveis de ambiente
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Configuração do TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
      inject: [ConfigService],
    }),

    // Entidades
    TypeOrmModule.forFeature([User]),

    // Módulos da aplicação
    AuthModule,
    UsersModule,
    ProfileModule,
    PacientesModule,
    AgendaSessoesModule,
    PacotesModule,
    PagamentosModule,
    ProntuariosModule,
  ],
  controllers: [AppController],
  providers: [AppService, UserSubscriber],
})
export class AppModule {}
