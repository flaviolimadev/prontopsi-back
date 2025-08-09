import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

@Injectable()
export class CloudflareR2Service {
  private readonly logger = new Logger(CloudflareR2Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly accountId: string;
  private readonly accessKeyId: string;
  private readonly secretAccessKey: string;

  constructor(private configService: ConfigService) {
    const accountId = this.configService.get<string>('CLOUDFLARE_ACCOUNT_ID');
    const accessKeyId = this.configService.get<string>('CLOUDFLARE_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('CLOUDFLARE_SECRET_ACCESS_KEY');
    const bucketName = this.configService.get<string>('CLOUDFLARE_R2_BUCKET_NAME');

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      this.logger.error('Configurações do Cloudflare R2 não encontradas');
      throw new Error('Configurações do Cloudflare R2 são obrigatórias');
    }

    this.accountId = accountId;
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.bucketName = bucketName;

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${this.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    });

    this.logger.log('Serviço Cloudflare R2 inicializado com sucesso');
  }

  /**
   * Faz upload de um arquivo para o R2
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
    customFileName?: string
  ): Promise<{ url: string; key: string; filename: string }> {
    try {
      const fileExtension = extname(file.originalname);
      const fileName = customFileName ? `${customFileName}${fileExtension}` : `${uuidv4()}${fileExtension}`;
      const key = `${folder}/${fileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.s3Client.send(command);

      // Gerar URL assinada para acesso público temporário
      const signedUrl = await this.generatePresignedDownloadUrl(key, 24 * 60 * 60); // 24 horas

      this.logger.log(`Arquivo enviado com sucesso: ${key}`);

      return {
        url: signedUrl,
        key,
        filename: fileName,
      };
    } catch (error) {
      this.logger.error(`Erro ao fazer upload do arquivo: ${error.message}`);
      throw new Error(`Falha no upload: ${error.message}`);
    }
  }

  /**
   * Faz upload de um buffer para o R2
   */
  async uploadBuffer(
    buffer: Buffer,
    originalName: string,
    mimetype: string,
    folder: string = 'uploads',
    customFileName?: string
  ): Promise<{ url: string; key: string; filename: string }> {
    try {
      const fileExtension = extname(originalName);
      const fileName = customFileName ? `${customFileName}${fileExtension}` : `${uuidv4()}${fileExtension}`;
      const key = `${folder}/${fileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
        Metadata: {
          originalName,
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.s3Client.send(command);

      const url = `https://${this.bucketName}.r2.dev/${key}`;

      this.logger.log(`Buffer enviado com sucesso: ${key}`);

      return {
        url,
        key,
        filename: fileName,
      };
    } catch (error) {
      this.logger.error(`Erro ao fazer upload do buffer: ${error.message}`);
      throw new Error(`Falha no upload: ${error.message}`);
    }
  }

  /**
   * Deleta um arquivo do R2
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);

      this.logger.log(`Arquivo deletado com sucesso: ${key}`);
      return true;
    } catch (error) {
      this.logger.error(`Erro ao deletar arquivo: ${error.message}`);
      return false;
    }
  }

  /**
   * Gera uma URL assinada para upload direto
   */
  async generatePresignedUploadUrl(
    fileName: string,
    contentType: string,
    folder: string = 'uploads',
    expiresIn: number = 3600
  ): Promise<{ uploadUrl: string; key: string }> {
    try {
      const fileExtension = extname(fileName);
      const uniqueFileName = `${uuidv4()}${fileExtension}`;
      const key = `${folder}/${uniqueFileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      return {
        uploadUrl,
        key,
      };
    } catch (error) {
      this.logger.error(`Erro ao gerar URL assinada: ${error.message}`);
      throw new Error(`Falha ao gerar URL: ${error.message}`);
    }
  }

  /**
   * Gera uma URL assinada para download
   */
  async generatePresignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const downloadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      return downloadUrl;
    } catch (error) {
      this.logger.error(`Erro ao gerar URL de download: ${error.message}`);
      throw new Error(`Falha ao gerar URL de download: ${error.message}`);
    }
  }

  /**
   * Extrai a chave do arquivo de uma URL do R2
   */
  extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      // Remove o primeiro elemento vazio e o bucket name
      const keyParts = pathParts.slice(2);
      
      return keyParts.join('/');
    } catch (error) {
      this.logger.error(`Erro ao extrair chave da URL: ${error.message}`);
      return null;
    }
  }

  /**
   * Verifica se uma URL é do R2
   */
  isR2Url(url: string): boolean {
    return url.includes('.r2.dev') || url.includes('.r2.cloudflarestorage.com');
  }
}
