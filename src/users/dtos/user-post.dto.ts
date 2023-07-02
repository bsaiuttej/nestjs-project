import { Transform } from 'class-transformer';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  roleIds: string[];
}

export class UpdateUserDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  roleIds: string[];
}
