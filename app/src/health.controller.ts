import { hostname } from 'node:os';
import { Controller, Get } from '@nestjs/common';

export const APP_VERSION = '1.0';

@Controller('health')
export class HealthController {
  /** Kubernetes probe болон аль Pod хариулж байгааг харахад ашиглана. */
  @Get()
  check(): { status: string; version: string; hostname: string; uptimeSeconds: number } {
    return {
      status: 'ok',
      version: APP_VERSION,
      hostname: hostname(),
      uptimeSeconds: Math.round(process.uptime()),
    };
  }
}
