import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from '../config/supabase.config';

/**
 * SupabaseService - Service for interacting with Supabase
 */
@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(SupabaseService.name);

  constructor(private readonly config: SupabaseConfig) {}

  onModuleInit() {
    if (!this.config.isValid()) {
      this.logger.error('Supabase configuration is invalid.');
      throw new Error('Supabase configuration is incomplete');
    }

    this.supabase = createClient(this.config.url, this.config.serviceKey);
    this.logger.log('Supabase client initialized successfully');
  }

  /**
   * Get the Supabase client
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Generate a signed URL for a file in storage
   */
  async createSignedUrl(
    bucket: string,
    path: string,
    expiresIn: number,
  ): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        this.logger.error(`Error creating signed URL: ${error.message}`);
        return null;
      }

      return data.signedUrl;
    } catch (err) {
      this.logger.error(`Failed to generate signed URL: ${err.message}`);
      return null;
    }
  }

  /**
   * List files in a storage bucket
   */
  async listFiles(bucket: string, path = ''): Promise<any[]> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .list(path, {
          limit: 100,
          offset: 0,
        });

      if (error) {
        this.logger.error(`Error listing files: ${error.message}`);
        return [];
      }

      return data || [];
    } catch (err) {
      this.logger.error(`Failed to list files: ${err.message}`);
      return [];
    }
  }
}
