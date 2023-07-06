import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type RolePermission = {
  permissionId: string;
  addedAt: Date;
};

const RolePermissionSchema = new MongooseSchema<RolePermission>(
  {
    permissionId: { type: String, required: true },
    addedAt: { type: Date, required: true },
  },
  { _id: false },
);

export const RoleCName = 'roles';

@Schema({ id: true, collection: RoleCName })
export class Role extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: [], type: [RolePermissionSchema] })
  permissions: RolePermission[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
RoleSchema.index({ name: 1 }, { unique: true });
