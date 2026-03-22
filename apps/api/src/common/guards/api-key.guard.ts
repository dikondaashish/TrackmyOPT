import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Check if endpoint is marked as @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Skip auth for public endpoints (e.g., health checks)
    }

    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'] as string | undefined;
    const validApiKey = this.configService.get<string>('API_SECRET_KEY');

    if (!validApiKey) {
      const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local';
      const logger = new Logger('ApiKeyGuard');
      if (isDev) {
        // If no API key is configured, log a warning but allow for local dev ONLY
        logger.warn('⚠️ API_SECRET_KEY not configured in development mode - API is unprotected!');
        return true;
      } else {
        // In production, failure to load the secret key MUST fail securely
        logger.error('CRITICAL: API_SECRET_KEY is missing in production environment');
        throw new UnauthorizedException('API key configuration error');
      }
    }

    if (!apiKey || apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid or missing API key');
    }

    return true;
  }
}
