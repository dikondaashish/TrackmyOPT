import { Controller, Post, Body } from '@nestjs/common';
import { UscisService } from './uscis.service';

@Controller('uscis')
export class UscisController {
    constructor(private readonly uscisService: UscisService) { }

    /**
     * Manually queue a check for a specific receipt
     */
    @Post('check')
    async queueCheck(@Body() body: { receiptNumber: string, userId: string }) {
        const job = await this.uscisService.queueCheckStatus(body.receiptNumber, body.userId);
        return {
            status: 'queued',
            jobId: job.id,
            timestamp: new Date(),
        };
    }

    /**
     * Queue checks for ALL active cases (called by Cron)
     */
    @Post('check-all')
    async checkAll() {
        const result = await this.uscisService.queueAllActiveCases();
        return {
            status: 'queued',
            count: result.count,
            timestamp: new Date()
        };
    }
}
