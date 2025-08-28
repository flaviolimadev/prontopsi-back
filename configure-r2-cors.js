const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

async function configureR2Cors() {
  console.log('🔧 Configurando CORS para o bucket R2...\n');

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    console.log('❌ Erro: Variáveis de ambiente não configuradas');
    return;
  }

  try {
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });

    const corsConfiguration = {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
          AllowedOrigins: ['*'],
          ExposeHeaders: ['ETag'],
          MaxAgeSeconds: 3000,
        },
      ],
    };

    const command = new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: corsConfiguration,
    });

    await s3Client.send(command);

    console.log('✅ CORS configurado com sucesso!');
    console.log('📋 Configuração aplicada:');
    console.log('   - AllowedHeaders: *');
    console.log('   - AllowedMethods: GET, PUT, POST, DELETE, HEAD');
    console.log('   - AllowedOrigins: *');
    console.log('   - MaxAgeSeconds: 3000');

  } catch (error) {
    console.log('❌ Erro ao configurar CORS:');
    console.log(`   ${error.message}`);
  }
}

configureR2Cors().catch(console.error);








