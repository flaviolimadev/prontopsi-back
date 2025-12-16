import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Aumentar limites do body parser para aceitar payloads maiores (ex.: avatar base64)
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  
  // Configurar CORS para aceitar o frontend
  const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:5173',
    'https://prontupsi.com',
    'https://www.prontupsi.com',
    'https://back.prontupsi.com',
    'https://back-end.prontupsi.com',
    process.env.FRONTEND_URL
  ].filter(Boolean);
  
  app.enableCors({
    origin: function (origin, callback) {
      // Permitir requisições sem origin (ex: mobile apps, Postman)
      if (!origin) return callback(null, true);
      
      // Verificar se a origin está na lista permitida
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      
      // Em desenvolvimento, permitir localhost com qualquer porta
      if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
        return callback(null, true);
      }
      
      console.log('🚫 CORS bloqueou origin:', origin);
      console.log('✅ Origins permitidas:', allowedOrigins);
      return callback(new Error('Bloqueado pela política de CORS'), false);
    },
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
  app.useStaticAssets(join(__dirname, '..', '..', 'uploads'), {
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
  console.log(`🌐 CORS configurado para origins:`, allowedOrigins);
  console.log(`📁 Arquivos estáticos em: http://localhost:${port}/uploads`);
}
bootstrap();
