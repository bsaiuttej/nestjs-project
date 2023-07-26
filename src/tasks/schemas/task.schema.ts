import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  MediaResource,
  MediaResourceSubSchema,
} from 'src/media-resources/schemas/media-resource.schema';

export const TaskCName = 'tasks';

export enum TaskStatusEnum {
  BACKLOG = 'BACKLOG',
  TO_DO = 'TO_DO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
}

@Schema({ id: true, collection: TaskCName, timestamps: true })
export class Task extends Document {
  @Prop({ required: true })
  taskId: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ default: TaskStatusEnum.BACKLOG })
  status: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ type: [MediaResourceSubSchema], default: [] })
  resources: MediaResource[];
}
export const TaskSchema = SchemaFactory.createForClass(Task);
