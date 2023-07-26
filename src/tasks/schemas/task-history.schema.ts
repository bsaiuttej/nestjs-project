import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ _id: false })
export class TaskValueChange {
  @Prop({ required: true })
  oldValue: string;

  @Prop({ required: true })
  newValue: string;
}
const TaskValueChangeSchema = SchemaFactory.createForClass(TaskValueChange);

export const TaskHistoryCName = 'task_history';

export const TaskHistoryTypeEnum = Object.freeze({
  CREATED: 'CREATED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  TITLE_CHANGED: 'TITLE_CHANGED',
  DESCRIPTION_CHANGED: 'DESCRIPTION_CHANGED',
  RESOURCES_CHANGED: 'RESOURCES_CHANGED',
  COMPLETED: 'COMPLETED',
});

@Schema({ id: true, collection: TaskHistoryCName })
export class TaskHistory extends Document {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  taskId: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  userId: string;

  @Prop({ required: true })
  type: string;

  @Prop({ type: TaskValueChangeSchema })
  value: TaskValueChange;

  @Prop({ required: true })
  createdAt: Date;
}
export const TaskHistorySchema = SchemaFactory.createForClass(TaskHistory);
