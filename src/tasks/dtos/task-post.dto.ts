import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TaskStatusEnum } from '../schemas/task.schema';

export class TaskPostDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  title: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  description: string;

  @IsNotEmpty()
  @IsEnum(TaskStatusEnum)
  status: TaskStatusEnum;
}
