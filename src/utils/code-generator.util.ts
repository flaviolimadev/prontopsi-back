/**
 * Gera um código único no formato: eDr5-tre1-2Gtfa
 * Formato: 4 caracteres - 4 caracteres - 5 caracteres
 */
export function generateUniqueCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // Primeira parte: 4 caracteres
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  result += '-';
  
  // Segunda parte: 4 caracteres
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  result += '-';
  
  // Terceira parte: 5 caracteres
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Valida se um código está no formato correto
 */
export function isValidCodeFormat(code: string): boolean {
  const codeRegex = /^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{5}$/;
  return codeRegex.test(code);
}

/**
 * Gera um código único e verifica se já existe no banco
 * (será usado com o repositório do TypeORM)
 */
export async function generateUniqueCodeWithCheck(
  checkExists: (code: string) => Promise<boolean>,
  maxAttempts: number = 10
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateUniqueCode();
    const exists = await checkExists(code);
    
    if (!exists) {
      return code;
    }
  }
  
  throw new Error('Não foi possível gerar um código único após várias tentativas');
} 