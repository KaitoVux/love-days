import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

interface UploadUrlOptions {
  bucket: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
  maxSizeBytes?: number;
}

interface UploadUrlResponse {
  uploadUrl: string;
  filePath: string;
}

@Injectable()
export class StorageService {
  private supabase: SupabaseClient<any, any, any>;
  private supabaseUrl: string;

  private readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  private readonly ALLOWED_AUDIO_TYPES = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/flac',
  ];

  constructor() {
    // Validate required environment variables
    if (!process.env.SUPABASE_URL) {
      throw new Error('SUPABASE_URL environment variable is required');
    }
    if (!process.env.SUPABASE_SERVICE_KEY) {
      throw new Error('SUPABASE_SERVICE_KEY environment variable is required');
    }

    this.supabaseUrl = process.env.SUPABASE_URL;
    this.supabase = createClient(
      this.supabaseUrl,
      process.env.SUPABASE_SERVICE_KEY,
    );
  }

  async generateUploadUrl(
    options: UploadUrlOptions,
  ): Promise<UploadUrlResponse> {
    const { bucket, fileName, fileType, fileSize, maxSizeBytes } = options;

    // Validate file size
    if (maxSizeBytes && fileSize && fileSize > maxSizeBytes) {
      throw new BadRequestException(
        `File size exceeds limit of ${maxSizeBytes / 1024 / 1024}MB`,
      );
    }

    // Validate file type
    if (!this.isValidFileType(bucket, fileType)) {
      throw new BadRequestException(`Invalid file type: ${fileType}`);
    }

    // Generate unique file path
    const extension = this.getExtension(fileName);
    const uuid = randomUUID();
    const filePath = `${uuid}${extension}`;

    // Generate presigned upload URL
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUploadUrl(filePath, {
        upsert: false,
      });

    if (error) {
      throw new BadRequestException(
        `Failed to generate upload URL: ${error.message}`,
      );
    }

    return {
      uploadUrl: data.signedUrl,
      filePath: `${bucket}/${filePath}`,
    };
  }

  getPublicUrl(bucket: string, filePath: string): string {
    // filePath may include bucket prefix, strip it if present
    const cleanPath = filePath.startsWith(`${bucket}/`)
      ? filePath.substring(bucket.length + 1)
      : filePath;

    return `${this.supabaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
  }

  async deleteFile(bucket: string, filePath: string): Promise<void> {
    const cleanPath = filePath.startsWith(`${bucket}/`)
      ? filePath.substring(bucket.length + 1)
      : filePath;

    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([cleanPath]);

    if (error) {
      throw new BadRequestException(`Failed to delete file: ${error.message}`);
    }
  }

  private isValidFileType(bucket: string, fileType: string): boolean {
    if (bucket === 'songs') {
      return this.ALLOWED_AUDIO_TYPES.includes(fileType.toLowerCase());
    }
    if (bucket === 'images') {
      return this.ALLOWED_IMAGE_TYPES.includes(fileType.toLowerCase());
    }
    return false;
  }

  private getExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    if (lastDot === -1) return '';

    const extension = fileName.substring(lastDot).toLowerCase();

    // Sanitize extension to prevent path traversal attacks
    const sanitized = extension.replace(/[^a-z0-9.]/g, '');

    // Validate extension is in allowed list
    const allowedExtensions = [
      '.mp3',
      '.wav',
      '.ogg',
      '.flac', // audio
      '.jpg',
      '.jpeg',
      '.png',
      '.webp',
      '.gif', // images
    ];

    if (!allowedExtensions.includes(sanitized)) {
      throw new BadRequestException(`File extension ${extension} not allowed`);
    }

    return sanitized;
  }
}
