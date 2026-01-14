import { Module } from '@nestjs/common';
import { SongsController } from './songs.controller';
import { SongsService } from './songs.service';
import { AuthModule } from '../auth/auth.module';
import { YouTubeModule } from '../youtube/youtube.module';

@Module({
  imports: [AuthModule, YouTubeModule],
  controllers: [SongsController],
  providers: [SongsService],
})
export class SongsModule {}
