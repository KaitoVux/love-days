import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class DeployService {
  private readonly webhookUrl = process.env.CLOUDFLARE_DEPLOY_HOOK_URL;

  async triggerCloudflareRebuild() {
    if (!this.webhookUrl) {
      throw new HttpException(
        'Cloudflare deploy hook not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Cloudflare API error: ${response.status} - ${errorText}`,
        );
      }

      return {
        success: true,
        message: 'Rebuild triggered successfully',
        timestamp: new Date().toISOString(),
        status: response.status,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to trigger Cloudflare rebuild:', errorMessage);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to trigger rebuild',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  getDeployStatus() {
    return {
      configured: !!this.webhookUrl,
      webhookConfigured: !!this.webhookUrl,
    };
  }
}
