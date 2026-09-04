import { Module } from '@nestjs/common';
import { OracleShadowProbeService } from './oracle-shadow-probe.service';

@Module({
  providers: [OracleShadowProbeService],
})
export class OracleShadowProbeModule {}
