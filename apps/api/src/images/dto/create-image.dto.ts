import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateImageDto {
  @ApiProperty({ maxLength: 255 })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ maxLength: 500 })
  @IsString()
  @MaxLength(500)
  filePath: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  fileSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  width?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  height?: number;

  @ApiProperty({ enum: ['profile', 'background', 'gallery'] })
  @IsString()
  @IsIn(['profile', 'background', 'gallery'])
  category: 'profile' | 'background' | 'gallery';
}
