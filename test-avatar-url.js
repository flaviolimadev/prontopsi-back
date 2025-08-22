const https = require('https');

async function testAvatarUrl() {
  console.log('🔍 Testando URL do avatar...\n');

  const avatarUrl = 'https://prontupsi.r2.dev/avatars/baab6095-7a3f-4394-b695-fb3455652361-1754701385737.jpeg';
  
  console.log(`📋 URL sendo testada: ${avatarUrl}\n`);

  return new Promise((resolve, reject) => {
    https.get(avatarUrl, (res) => {
      console.log(`📊 Status Code: ${res.statusCode}`);
      console.log(`📋 Content-Type: ${res.headers['content-type']}`);
      console.log(`📏 Content-Length: ${res.headers['content-length']} bytes`);
      
      if (res.statusCode === 200) {
        console.log('✅ Avatar está acessível!');
        resolve(true);
      } else {
        console.log('❌ Avatar não está acessível');
        resolve(false);
      }
    }).on('error', (err) => {
      console.log('❌ Erro ao acessar avatar:');
      console.log(`   ${err.message}`);
      resolve(false);
    });
  });
}

testAvatarUrl().catch(console.error);






