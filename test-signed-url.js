const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
require('dotenv').config();

async function testSignedUrl() {
  console.log('🔍 Testando geração de URL assinada...\n');

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

    // Testar com o arquivo que existe
    const key = 'avatars/baab6095-7a3f-4394-b695-fb3455652361-1754701654710.jpeg';
    
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hora
    });

    console.log('✅ URL assinada gerada com sucesso!');
    console.log(`📋 URL: ${signedUrl}`);
    console.log(`⏰ Expira em: 1 hora`);

    // Testar se a URL funciona
    const https = require('https');
    
    return new Promise((resolve) => {
      https.get(signedUrl, (res) => {
        console.log(`\n📊 Teste de acesso:`);
        console.log(`   Status Code: ${res.statusCode}`);
        console.log(`   Content-Type: ${res.headers['content-type']}`);
        console.log(`   Content-Length: ${res.headers['content-length']} bytes`);
        
        if (res.statusCode === 200) {
          console.log('✅ URL assinada está funcionando!');
        } else {
          console.log('❌ URL assinada não está funcionando');
        }
        resolve();
      }).on('error', (err) => {
        console.log('❌ Erro ao testar URL assinada:');
        console.log(`   ${err.message}`);
        resolve();
      });
    });

  } catch (error) {
    console.log('❌ Erro ao gerar URL assinada:');
    console.log(`   ${error.message}`);
  }
}

testSignedUrl().catch(console.error);







