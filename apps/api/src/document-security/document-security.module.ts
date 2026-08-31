import { Module } from '@nestjs/common';
import { LatexController } from './latex.controller';
import { ScanController } from './scan.controller';

@Module({
  controllers: [ScanController, LatexController],
})
export class DocumentSecurityModule {}
