const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

async function deleteOldAvatar() {
  console.log('🗑️ Deletando arquivo antigo sem extensão...\n');

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

    // Deletar o arquivo antigo sem extensão
    const oldKey = 'avatars/baab6095-7a3f-4394-b695-fb3455652361-1754701247625';
    
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: oldKey,
    });

    await s3Client.send(command);

    console.log('✅ Arquivo antigo deletado com sucesso!');
    console.log(`🗑️ Deletado: ${oldKey}`);

  } catch (error) {
    console.log('❌ Erro ao deletar arquivo:');
    console.log(`   ${error.message}`);
  }
}

deleteOldAvatar().catch(console.error);








