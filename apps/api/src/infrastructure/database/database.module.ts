import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { SupabaseConfig } from '../config/supabase.config';
import { SupabaseSongRepository } from './song.repository';
import { SONG_REPOSITORY } from '../../domain/repositories/song.repository.interface';

@Module({
  providers: [
    SupabaseService,
    SupabaseConfig,
    {
      provide: SONG_REPOSITORY,
      useClass: SupabaseSongRepository,
    },
  ],
  exports: [
    SupabaseService,
    {
      provide: SONG_REPOSITORY,
      useClass: SupabaseSongRepository,
    },
  ],
})
export class DatabaseModule {}
