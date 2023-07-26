import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const UniqueIdGeneratorCName = 'unique_id_generator';

@Schema({ id: true, collection: UniqueIdGeneratorCName })
export class UniqueIdGenerator extends Document {
  @Prop({ required: true, unique: true })
  index: string;

  @Prop({ default: 0 })
  taskId: number;
}
export const UniqueIdGeneratorSchema = SchemaFactory.createForClass(UniqueIdGenerator);
