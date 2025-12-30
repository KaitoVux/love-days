import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { DeployService } from './deploy.service';
import { DeployResponseDto } from './dto/deploy-response.dto';
import { SupabaseAuthGuard } from '../auth/auth.guard';

@ApiTags('deploy')
@Controller('api/v1/deploy')
export class DeployController {
  constructor(private readonly deployService: DeployService) {}

  @Post('trigger')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trigger Cloudflare Pages rebuild (admin only)' })
  @ApiResponse({ status: 200, type: DeployResponseDto })
  @ApiResponse({ status: 503, description: 'Webhook not configured' })
  @ApiResponse({ status: 500, description: 'Rebuild trigger failed' })
  async triggerRebuild(): Promise<DeployResponseDto> {
    return this.deployService.triggerCloudflareRebuild();
  }

  @Get('status')
  @ApiOperation({ summary: 'Check deploy configuration status' })
  getStatus() {
    return this.deployService.getDeployStatus();
  }
}
