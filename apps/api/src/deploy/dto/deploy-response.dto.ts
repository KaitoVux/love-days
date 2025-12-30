import { ApiProperty } from '@nestjs/swagger';

export class DeployResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  timestamp: string;

  @ApiProperty({ required: false })
  status?: number;

  @ApiProperty({ required: false })
  error?: string;
}
