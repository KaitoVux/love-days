import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * SupabaseConfig - Configuration for Supabase
 */
@Injectable()
export class SupabaseConfig {
  constructor(private configService: ConfigService) {}

  get url(): string {
    return this.configService.get<string>('SUPABASE_URL') || '';
  }

  get serviceKey(): string {
    return this.configService.get<string>('SUPABASE_SERVICE_KEY') || '';
  }

  get songsBucket(): string {
    return this.configService.get<string>('SUPABASE_SONGS_BUCKET') || 'songs';
  }

  isValid(): boolean {
    return Boolean(this.url && this.serviceKey);
  }
}
