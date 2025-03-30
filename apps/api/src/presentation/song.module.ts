import { Module } from '@nestjs/common';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { SongService } from '../domain/services/song.service';
import { GetAllSongsUseCase } from '../application/use-cases/song/get-all-songs.use-case';
import { GetSignedUrlUseCase } from '../application/use-cases/song/get-signed-url.use-case';
import { SongController } from './controllers/song.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [SongController],
  providers: [SongService, GetAllSongsUseCase, GetSignedUrlUseCase],
})
export class SongModule {}
