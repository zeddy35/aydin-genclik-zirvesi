import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// R2 API credentials (from .env.local)
const client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || "",
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Generate presigned URL for direct client-side upload to R2
 * 
 * @param key - S3 object key (path in bucket)
 * @param contentType - MIME type of file
 * @param expiresIn - Seconds until URL expires (default: 3600)
 * @returns Presigned URL for PUT request
 */
export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(client, command, { expiresIn });
  return url;
}

/**
 * Generate presigned URL for downloading file from R2
 * 
 * @param key - S3 object key
 * @param expiresIn - Seconds until URL expires (default: 86400 = 1 day)
 * @returns Presigned URL for GET request
 */
export async function generatePresignedDownloadUrl(
  key: string,
  expiresIn = 86400
): Promise<string> {
  const { GetObjectCommand } = await import("@aws-sdk/client-s3");
  const command = new GetObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: key,
  });

  const url = await getSignedUrl(client, command, { expiresIn });
  return url;
}

/**
 * Delete object from R2
 * 
 * @param key - S3 object key
 */
export async function deleteR2Object(key: string): Promise<void> {
  const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
  const command = new DeleteObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: key,
  });

  await client.send(command);
}
