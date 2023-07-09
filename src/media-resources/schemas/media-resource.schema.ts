import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export const MediaResourceCName = 'media_resources';

@Schema({
  id: true,
  collection: MediaResourceCName,
  virtuals: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class MediaResource extends Document {
  @Prop()
  originalFileName: string;

  @Prop({ required: true })
  key: string;

  @Prop()
  type: string;

  @Prop()
  subtype: string;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  typeId: string;

  @Prop()
  mediaType: string;

  @Prop()
  mimeType: string;

  @Prop()
  fileSize: number;

  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  s3Response: any;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  createdBy: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  url: string;
}

export const MediaResourceSchema = SchemaFactory.createForClass(MediaResource);
MediaResourceSchema.index({ key: 1 }, { unique: true });
MediaResourceSchema.index({ type: 1, subtype: 1, typeId: 1 });

MediaResourceSchema.virtual('url').get(function () {
  return `${process.env.AWS_S3_BUCKET_BASE_URL}/${this.key}`;
});

export const MediaResourceSubSchema = SchemaFactory.createForClass(MediaResource);
MediaResourceSubSchema.virtual('url').get(function () {
  return `${process.env.AWS_S3_BUCKET_BASE_URL}/${this.key}`;
});
