import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import {
  MediaResource,
  MediaResourceSubSchema,
} from 'src/media-resources/schemas/media-resource.schema';
import { User } from 'src/users/schemas/user.schema';

@Schema()
export class FeedText {
  @Prop()
  text: string;

  @Prop({ default: false })
  isLink: boolean;

  @Prop()
  link: string;
}
const FeedTextSchema = SchemaFactory.createForClass(FeedText);

export enum FeeContentType {
  TEXT = 'text',
  IMAGE = 'image',
}

@Schema()
export class FeedContent {
  @Prop({ type: MongooseSchema.Types.ObjectId })
  _id: string;

  @Prop()
  type: string;

  @Prop({ type: [FeedTextSchema], default: [] })
  text: FeedText[];

  @Prop({ type: [MediaResourceSubSchema], default: [] })
  resources: MediaResource[];
}
const FeedContentSchema = SchemaFactory.createForClass(FeedContent);

export const FeedCName = 'feed';

@Schema({ id: true, timestamps: true, collection: FeedCName })
export class Feed extends Document {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop()
  type: string;

  @Prop({ trim: true })
  shortDescription: string;

  @Prop({ type: [FeedContentSchema], default: [] })
  body: FeedContent[];

  @Prop({ type: [MediaResourceSubSchema], default: [] })
  logos: MediaResource[];

  @Prop({ default: true })
  tags: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId })
  createdById: string;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  updatedById: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  createdBy: User;
}

export const FeedSchema = SchemaFactory.createForClass(Feed);
FeedSchema.index({ title: 'text', shortDescription: 'text', type: 'text', tags: 'text' });
