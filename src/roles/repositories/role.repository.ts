import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { getObjectId } from 'src/utils/util-functions';
import { RolesGetDto } from '../dtos/roles.dto';
import { Role } from '../schemas/role.schema';

export const UPDATE_ROLE_EVENT = 'UPDATE_ROLE_EVENT';
export const DELETE_ROLE_EVENT = 'DELETE_ROLE_EVENT';

@Injectable()
export class RoleRepository {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  create(data?: unknown) {
    const instance = new this.roleModel(data);
    instance.permissions = [];
    return instance;
  }

  save(role: Role) {
    if (!role.isModified()) return role;

    role.updatedAt = new Date();
    if (role.isNew) {
      role.createdAt = new Date();
    }

    if (!role.isNew) {
      this.eventEmitter.emitAsync(UPDATE_ROLE_EVENT, role._id, role);
    }

    return role.save();
  }

  async deleteById(id: string) {
    this.eventEmitter.emitAsync(DELETE_ROLE_EVENT, id);
    await this.roleModel.deleteOne({ _id: getObjectId(id) }).exec();
  }

  async countByName(name: string, excludeId?: string) {
    return this.roleModel
      .countDocuments({ name, ...(excludeId ? { _id: { $ne: getObjectId(excludeId) } } : {}) })
      .exec();
  }

  async findById(id: string) {
    return this.roleModel.findById(id).exec();
  }

  async findByIds(ids: string[]) {
    if (!ids.length) return [];
    return this.roleModel.find({ _id: { $in: ids } }).exec();
  }

  async find(query: RolesGetDto) {
    const builder = this.roleModel.aggregate();
    if (query.search) {
      builder.match({
        $or: [
          { name: { $regex: query.search, $options: 'i' } },
          { 'permissions.permissionId': query.search },
        ],
      });
    }

    const result = await builder.facet({
      count: [{ $count: 'count' }],
      roles: [{ $skip: query.skip || 0 }, { $limit: query.limit || Number.MAX_SAFE_INTEGER }],
    });

    return {
      count: Number(result[0].count[0]?.count || 0),
      roles: (result[0].roles || []) as Role[],
    };
  }
}
