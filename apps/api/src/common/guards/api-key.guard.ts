import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(private configService: ConfigService) { }

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['x-api-key'];
        const validApiKey = this.configService.get<string>('API_SECRET_KEY');

        if (!validApiKey) {
            // If no API key is configured, log a warning but allow (for local dev)
            console.warn('⚠️ API_SECRET_KEY not configured - API is unprotected!');
            return true;
        }

        if (!apiKey || apiKey !== validApiKey) {
            throw new UnauthorizedException('Invalid or missing API key');
        }

        return true;
    }
}
