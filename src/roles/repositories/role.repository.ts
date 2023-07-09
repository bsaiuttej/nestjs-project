import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { getObjectId } from 'src/utils/util-functions';
import { RolesGetDto } from '../dtos/roles.dto';
import { Role } from '../schemas/role.schema';

@Injectable()
export class RoleRepository {
  constructor(@InjectModel(Role.name) private readonly roleModel: Model<Role>) {}

  create(data?: unknown) {
    const instance = new this.roleModel(data);
    instance.permissions = [];
    return instance;
  }

  save(role: Role) {
    if (role.isNew) {
      role.createdAt = new Date();
      role.updatedAt = new Date();
    }

    if (role.isModified()) {
      role.updatedAt = new Date();
    }

    return role.save();
  }

  async deleteById(id: string) {
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
