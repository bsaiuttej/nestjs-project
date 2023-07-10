import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { FeeContentType } from '../schema/feed.schema';

export class CreateFeedDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  title: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  shortDescription: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  logos: string[];

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => FeedContentPostDto)
  feedBody: FeedContentPostDto[];
}

export class FeedContentPostDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(Object.values(FeeContentType))
  type: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeedTextPostDto)
  text: FeedTextPostDto[];

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  resources: string[];
}

export class FeedTextPostDto {
  @IsNotEmpty()
  @IsBoolean()
  isLink: boolean;

  @ValidateIf((o) => o.isLink)
  @IsString()
  @Transform(({ value }) => value?.trim())
  link: string;

  @IsNotEmpty()
  @IsString()
  text: string;
}

export class AddFeeContentDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => FeedContentPostDto)
  content: FeedContentPostDto;

  @IsNotEmpty()
  @IsNumber()
  index: number;
}

export class ReorderFeedContentDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  contentIds: string[];
}

export class UpdateFeedDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  title: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  shortDescription: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  logos: string[];
}
