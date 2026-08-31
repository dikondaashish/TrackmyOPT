import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class LatexResourceDto {
  @IsOptional()
  @IsBoolean()
  main?: boolean;

  @IsString()
  content!: string;
}

export class CompileLatexDto {
  @IsOptional()
  @IsString()
  compiler?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LatexResourceDto)
  resources!: LatexResourceDto[];
}
