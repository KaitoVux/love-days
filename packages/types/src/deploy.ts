/**
 * Deploy API Response DTOs
 */

export interface DeployResponseDto {
  success: boolean;
  message: string;
  timestamp: string;
  status?: number;
  error?: string;
}

export interface DeployStatusDto {
  configured: boolean;
  webhookConfigured: boolean;
}
