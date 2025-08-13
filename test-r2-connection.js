const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

async function testR2Connection() {
  console.log('🔍 Testando conexão com Cloudflare R2...\n');

  // Verificar variáveis de ambiente
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;

  console.log('📋 Variáveis de ambiente:');
  console.log(`  Account ID: ${accountId ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`  Access Key ID: ${accessKeyId ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`  Secret Access Key: ${secretAccessKey ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`  Bucket Name: ${bucketName ? '✅ Configurado' : '❌ Não configurado'}\n`);

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    console.log('❌ Erro: Todas as variáveis de ambiente são obrigatórias');
    console.log('\n📝 Configure as seguintes variáveis no arquivo .env:');
    console.log('CLOUDFLARE_ACCOUNT_ID=seu_account_id');
    console.log('CLOUDFLARE_ACCESS_KEY_ID=seu_access_key_id');
    console.log('CLOUDFLARE_SECRET_ACCESS_KEY=seu_secret_access_key');
    console.log('CLOUDFLARE_R2_BUCKET_NAME=nome_do_seu_bucket');
    return;
  }

  try {
    // Criar cliente S3 para R2
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });

    console.log('🔗 Testando conexão com o endpoint R2...');

    // Testar listagem de buckets
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);

    console.log('✅ Conexão estabelecida com sucesso!');
    console.log(`📦 Buckets disponíveis: ${response.Buckets?.length || 0}`);

    if (response.Buckets && response.Buckets.length > 0) {
      console.log('\n📋 Lista de buckets:');
      response.Buckets.forEach((bucket, index) => {
        console.log(`  ${index + 1}. ${bucket.Name} (criado em: ${bucket.CreationDate})`);
      });
    }

    // Verificar se o bucket específico existe
    const bucketExists = response.Buckets?.some(bucket => bucket.Name === bucketName);
    
    if (bucketExists) {
      console.log(`\n✅ Bucket "${bucketName}" encontrado!`);
      console.log('🎉 Configuração do R2 está funcionando corretamente.');
    } else {
      console.log(`\n⚠️  Bucket "${bucketName}" não encontrado.`);
      console.log('📝 Verifique se o nome do bucket está correto ou crie o bucket no dashboard do Cloudflare.');
    }

  } catch (error) {
    console.log('❌ Erro ao conectar com o R2:');
    console.log(`   ${error.message}`);
    
    if (error.name === 'AccessDenied') {
      console.log('\n💡 Possíveis soluções:');
      console.log('   1. Verifique se as credenciais estão corretas');
      console.log('   2. Verifique se o Account ID está correto');
      console.log('   3. Verifique se o token tem permissões para R2');
    } else if (error.name === 'NoSuchBucket') {
      console.log('\n💡 O bucket especificado não existe.');
      console.log('   Crie o bucket no dashboard do Cloudflare R2.');
    }
  }
}

// Executar o teste
testR2Connection().catch(console.error);



