import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from 'src/roles/schemas/role.schema';

export const UserCName = 'users';

const RoleSchema = SchemaFactory.createForClass(Role);

@Schema({ id: true, collection: UserCName, timestamps: true })
export class User extends Document {
  @Prop({ required: true, trim: true, unique: true, index: true })
  email: string;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: [], type: [RoleSchema] })
  roles: Role[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });
