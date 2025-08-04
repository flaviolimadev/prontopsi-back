import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Configurar CORS para aceitar o frontend
  app.enableCors({
    origin: [
      'http://localhost:3000',  // Vite dev server
      'http://localhost:8080',  // Vite dev server (porta alternativa)
      'http://localhost:5173',  // Vite dev server (porta padrão)
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:5173',
      ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []), // URL do frontend configurada no .env
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
  });
  
  // Configurar validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Temporariamente desabilitado para debug
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  // Configurar arquivos estáticos para avatars
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
    setHeaders: (res, path) => {
      // Permitir CORS para imagens
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      
      // Definir cache para imagens
      if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.gif')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 ano
      }
      
      // Log para debug
      console.log('Servindo arquivo estático:', path);
    }
  });
  
  // Prefixo global para APIs
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Backend rodando na porta ${port}`);
  console.log(`📊 API disponível em: http://localhost:${port}/api`);
  console.log(`🌐 CORS configurado para frontend`);
  console.log(`📁 Arquivos estáticos em: http://localhost:${port}/uploads`);
}
bootstrap();
