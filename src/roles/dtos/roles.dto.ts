import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class RolePostDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim()?.toUpperCase())
  name: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}

export class RolesGetDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  skip?: number;
}
