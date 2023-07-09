import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Document } from 'mongoose';
import {
  MediaResource,
  MediaResourceSubSchema,
} from 'src/media-resources/schemas/media-resource.schema';
import { Role, RoleSubSchema } from 'src/roles/schemas/role.schema';

export const UserCName = 'users';

@Schema({ id: true, collection: UserCName, timestamps: true })
export class User extends Document {
  @Prop({ required: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ trim: true })
  lastName: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: [], type: [RoleSubSchema] })
  roles: Role[];

  @Prop({ default: false })
  isSuperUser: boolean;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ type: MediaResourceSubSchema })
  profileImage: MediaResource;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  correctPassword: (currPassword: string) => Promise<boolean>;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

UserSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 10
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.correctPassword = async function (currPassword: string) {
  return await bcrypt.compare(currPassword, this.password);
};
