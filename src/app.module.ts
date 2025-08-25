import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PacientesModule } from './pacientes/pacientes.module';
import { AgendaSessoesModule } from './agenda-sessoes/agenda-sessoes.module';
import { ProntuariosModule } from './prontuarios/prontuarios.module';
import { PacotesModule } from './pacotes/pacotes.module';
import { PagamentosModule } from './pagamentos/pagamentos.module';
import { EfiPixModule } from './pagamentos/efi-pix.module';
import { ProfileModule } from './profile/profile.module';
import { CadastroLinksModule } from './cadastro-links/cadastro-links.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnamnesesModule } from './anamneses/anamneses.module';
import { AutomationApiModule } from './automation-api/automation-api.module';
import { PublicModule } from './public/public.module';
import { getDatabaseConfig } from './config/database.config';
import { UserSubscriber } from './entities/subscribers/user.subscriber';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    PacientesModule,
    AgendaSessoesModule,
    ProntuariosModule,
    PacotesModule,
    PagamentosModule,
    EfiPixModule,
    ProfileModule,
    CadastroLinksModule,
    NotificationsModule,
    AnamnesesModule,
    AutomationApiModule,
    PublicModule,
  ],
  controllers: [AppController],
  providers: [AppService, UserSubscriber],
})
export class AppModule {}
