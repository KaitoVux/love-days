import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SongUploadUrlDto {
  @ApiProperty({ description: 'Original file name', example: 'my-song.mp3' })
  @IsString()
  fileName: string;

  @ApiProperty({ description: 'MIME type', example: 'audio/mpeg' })
  @IsString()
  fileType: string;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(52428800) // 50MB
  fileSize?: number;
}
