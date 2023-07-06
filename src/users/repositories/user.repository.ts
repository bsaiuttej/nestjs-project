import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from 'src/roles/schemas/role.schema';
import { getObjectId } from 'src/utils/util-functions';
import { UsersGetDto } from '../dtos/user-get.dto';
import { User } from '../schemas/user.schema';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  create(data?: unknown) {
    const instance = new this.userModel(data);
    instance.roles = [];
    return instance;
  }

  save(user: User) {
    return user.save();
  }

  async updateRole(id: string, role: Role) {
    await this.userModel.updateMany(
      { roles: { $elemMatch: { _id: getObjectId(id) } } },
      { $set: { 'roles.$': role } },
    );
  }

  async removeRole(roleId: string) {
    await this.userModel.updateOne(
      { roles: { $elemMatch: { _id: getObjectId(roleId) } } },
      { $pull: { roles: { _id: getObjectId(roleId) } } },
    );
  }

  async deleteById(id: string) {
    await this.userModel.deleteOne({ _id: id }).exec();
  }

  async countByEmail(email: string, excludeId?: string) {
    return this.userModel
      .countDocuments({ email, ...(excludeId ? { _id: { $ne: getObjectId(excludeId) } } : {}) })
      .exec();
  }

  async findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  async find(query: UsersGetDto) {
    const builder = this.userModel.aggregate();
    if (query.search) {
      const splitSearch = query.search.split(' ');
      builder.match({
        $or: [
          ...splitSearch.map((search) => ({
            firstName: { $regex: search, $options: 'i' },
          })),
          ...splitSearch.map((search) => ({
            lastName: { $regex: search, $options: 'i' },
          })),
          { email: { $regex: query.search, $options: 'i' } },
        ],
      });
    }

    const result = await builder.facet({
      count: [{ $count: 'count' }],
      users: [{ $skip: query.skip || 0 }, { $limit: query.limit || Number.MAX_SAFE_INTEGER }],
    });

    return {
      count: Number(result[0].count[0]?.count || 0),
      users: (result[0].users || []) as User[],
    };
  }
}
