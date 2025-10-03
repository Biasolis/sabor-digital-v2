import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import 'dotenv/config';
import crypto from 'crypto';

const bucketName = process.env.MINIO_BUCKET_NAME;
const endpoint = process.env.MINIO_ENDPOINT;
const accessKeyId = process.env.MINIO_ACCESS_KEY;
const secretAccessKey = process.env.MINIO_SECRET_KEY;

const s3Client = new S3Client({
  endpoint,
  forcePathStyle: true, // Essencial para MinIO
  region: 'us-east-1', // Região padrão, pode ser qualquer uma
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export async function uploadFile(fileBuffer, mimetype, tenantId) {
  const randomFileName = (bytes = 16) => crypto.randomBytes(bytes).toString('hex');
  const fileName = `${tenantId}/${randomFileName()}`;
  
  const uploadParams = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimetype,
  };

  await s3Client.send(new PutObjectCommand(uploadParams));

  // Retorna a URL pública do arquivo
  return `${endpoint}/${bucketName}/${fileName}`;
}