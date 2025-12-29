import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ImageUploadUrlDto {
  @ApiProperty({ description: 'Original file name', example: 'photo.jpg' })
  @IsString()
  fileName: string;

  @ApiProperty({ description: 'MIME type', example: 'image/jpeg' })
  @IsString()
  fileType: string;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5242880) // 5MB
  fileSize?: number;
}
