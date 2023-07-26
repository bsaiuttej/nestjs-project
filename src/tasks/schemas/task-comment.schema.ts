import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import {
  MediaResource,
  MediaResourceSubSchema,
} from 'src/media-resources/schemas/media-resource.schema';

export const TaskCommentCName = 'task_comments';

@Schema({ id: true, collection: TaskCommentCName, timestamps: true })
export class TaskComment extends Document {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  taskId: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  userId: string;

  @Prop({ trim: true })
  content: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ type: [MediaResourceSubSchema], default: [] })
  resources: MediaResource[];
}
export const TaskCommentSchema = SchemaFactory.createForClass(TaskComment);
