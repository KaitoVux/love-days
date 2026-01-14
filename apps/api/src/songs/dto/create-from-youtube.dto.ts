import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFromYoutubeDto {
  @ApiProperty({
    description: 'YouTube video URL or video ID',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  })
  @IsString()
  @IsNotEmpty()
  youtubeUrl: string;
}
