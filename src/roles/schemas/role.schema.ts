import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class RolePermission {
  @Prop({ required: true })
  permissionId: string;

  @Prop({ required: true })
  addedAt: Date;
}

const RolePermissionSchema = SchemaFactory.createForClass(RolePermission);

export const RoleCName = 'roles';

@Schema({ id: true, collection: RoleCName })
export class Role extends Document {
  @Prop({ required: true, trim: true, uppercase: true })
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

export const RoleSubSchema = SchemaFactory.createForClass(Role);
