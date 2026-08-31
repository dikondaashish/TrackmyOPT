import {
  Body,
  Controller,
  Headers,
  HttpException,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Public } from '../common/decorators/public.decorator';
import { bearerMatches } from './bearer-token';
import { compileLatexPdf, extractMainLatex } from './compile-latex';
import { CompileLatexDto } from './compile-latex.dto';

@Controller()
export class LatexController {
  constructor(private readonly config: ConfigService) {}

  @Public()
  @Post('builds/sync')
  async compile(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: CompileLatexDto,
    @Res() res: Response,
  ) {
    const token = this.config.get<string>('LATEX_COMPILER_TOKEN');
    if (!token?.trim()) {
      throw new HttpException(
        'LaTeX compiler is not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    if (!bearerMatches(authorization, token)) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const latex = extractMainLatex(body?.resources);
    if (!latex) {
      throw new HttpException(
        'LaTeX resources are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const pdf = await compileLatexPdf(latex);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).send(pdf);
    } catch {
      throw new HttpException(
        'LaTeX compilation failed',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
}
