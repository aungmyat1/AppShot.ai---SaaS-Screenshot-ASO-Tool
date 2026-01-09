/**
 * SERVER-SIDE CODE (Node.js)
 * This file is intended for the backend worker (e.g., Railway/AWS Lambda).
 * It is NOT used in the client-side bundle but serves as the implementation
 * reference for the full-stack SaaS.
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";
import axios from "axios";
import { Buffer } from "buffer";

// Cloudflare R2 Configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || '',
    secretAccessKey: R2_SECRET_ACCESS_KEY || '',
  },
});

interface OptimizedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: 'webp';
  size: number;
}

export class StorageService {
  /**
   * Downloads an image, optimizes it using Sharp, and returns the buffer.
   */
  static async optimizeImage(imageUrl: string): Promise<OptimizedImage> {
    try {
      // 1. Download Image
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);

      // 2. Optimize with Sharp
      const pipeline = sharp(buffer);
      const metadata = await pipeline.metadata();

      // Resize if too large (e.g. > 1920px height) while maintaining aspect ratio
      if (metadata.height && metadata.height > 1920) {
        pipeline.resize({ height: 1920 });
      }

      // Convert to WebP for better compression
      const optimizedBuffer = await pipeline
        .webp({ quality: 85 })
        .toBuffer();

      const optimizedMetadata = await sharp(optimizedBuffer).metadata();

      return {
        buffer: optimizedBuffer,
        width: optimizedMetadata.width || 0,
        height: optimizedMetadata.height || 0,
        format: 'webp',
        size: optimizedBuffer.length
      };
    } catch (error) {
      console.error('Image optimization failed:', error);
      throw error;
    }
  }

  /**
   * Uploads the optimized buffer to Cloudflare R2.
   */
  static async uploadToR2(
    fileBuffer: Buffer, 
    userId: string, 
    appId: string, 
    fileName: string
  ): Promise<{ key: string; url: string }> {
    const key = `${userId}/${appId}/${fileName}`;

    try {
      await s3Client.send(new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000', // Cache for 1 year
      }));

      // Generate Public URL (if public bucket)
      const publicUrl = `${R2_PUBLIC_URL}/${key}`;

      // Alternatively, generate Signed URL for private buckets
      // const signedUrl = await getSignedUrl(s3Client, new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }), { expiresIn: 3600 });

      return { key, url: publicUrl };
    } catch (error) {
      console.error('R2 Upload failed:', error);
      throw error;
    }
  }

  /**
   * Full pipeline: URL -> Optimized -> R2
   */
  static async processAndStoreScreenshot(
    originalUrl: string, 
    userId: string, 
    appId: string, 
    index: number
  ) {
    const optimized = await this.optimizeImage(originalUrl);
    const result = await this.uploadToR2(
      optimized.buffer, 
      userId, 
      appId, 
      `screenshot-${index}.webp`
    );

    return {
      ...result,
      width: optimized.width,
      height: optimized.height,
      size: optimized.size
    };
  }
}