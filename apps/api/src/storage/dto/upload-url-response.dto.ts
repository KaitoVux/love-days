import { ApiProperty } from '@nestjs/swagger';

export class UploadUrlResponseDto {
  @ApiProperty({ description: 'Presigned upload URL' })
  uploadUrl: string;

  @ApiProperty({
    description: 'File path for metadata',
    example: 'songs/uuid-filename.mp3',
  })
  filePath: string;
}
