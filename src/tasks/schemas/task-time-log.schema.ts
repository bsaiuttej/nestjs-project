import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export const TaskTimelogCName = 'task_timelog';

@Schema({ id: true, collection: TaskTimelogCName })
export class TaskTimelog extends Document {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  taskId: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  userId: string;

  @Prop({ required: true })
  startedAt: Date;

  @Prop()
  endedAt: Date;
}
export const TaskTimelogSchema = SchemaFactory.createForClass(TaskTimelog);
TaskTimelogSchema.index({ taskId: 1, startedAt: -1, endedAt: -1 });
TaskTimelogSchema.index({ userId: 1, startedAt: -1, endedAt: -1 });
