import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllowNullableUserId20250818000001 implements MigrationInterface {
  name = 'AllowNullableUserId20250818000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔧 Alterando coluna userId para nullable...');
    
    // Verificar se a coluna existe e se é NOT NULL
    const columnInfo = await queryRunner.query(`
      SELECT is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'pix_transactions' 
      AND column_name = 'userId'
    `);

    if (columnInfo.length > 0 && columnInfo[0].is_nullable === 'NO') {
      // Alterar coluna para permitir NULL
      await queryRunner.query(`
        ALTER TABLE "pix_transactions" 
        ALTER COLUMN "userId" DROP NOT NULL
      `);
      console.log('✅ Coluna userId alterada para nullable');
    } else {
      console.log('ℹ️ Coluna userId já é nullable ou não existe');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Revertendo coluna userId para NOT NULL...');
    
    // Reverter para NOT NULL
    await queryRunner.query(`
      ALTER TABLE "pix_transactions" 
      ALTER COLUMN "userId" SET NOT NULL
    `);
    console.log('✅ Coluna userId revertida para NOT NULL');
  }
}
