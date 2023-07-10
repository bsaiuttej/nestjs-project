import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DELETE_ROLE_EVENT, UPDATE_ROLE_EVENT } from 'src/roles/repositories/role.repository';
import { Role } from 'src/roles/schemas/role.schema';
import { LocalStore } from 'src/utils/local-store/local-store';
import { getObjectId } from 'src/utils/util-functions';
import { UsersGetDto } from '../dtos/user-get.dto';
import { User } from '../schemas/user.schema';

const UserLocalStoreName = 'user-local-store';

@Injectable()
export class UserRepository {
  private readonly userStore: LocalStore<User>;

  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
    this.userStore = LocalStore.create({
      storeName: UserLocalStoreName,
      fn: async (key: string) => {
        return await this.userModel.findById(key).exec();
      },
    });
  }

  create(data?: unknown) {
    const instance = new this.userModel(data);
    instance.roles = [];
    return instance;
  }

  async save(user: User) {
    if (!user.isModified()) return user;

    const result = await user.save();
    this.userStore.set(result.id, result);
    return result;
  }

  @OnEvent(UPDATE_ROLE_EVENT, { async: true })
  protected async updateRole(roleId: string, role: Role) {
    const userIds = await this.findIdsByRoleId(roleId);

    await this.userModel.updateMany(
      { roles: { $elemMatch: { _id: getObjectId(roleId) } } },
      { $set: { 'roles.$': role } },
    );

    this.userStore.remove(userIds);
  }

  @OnEvent(DELETE_ROLE_EVENT, { async: true })
  protected async removeRole(roleId: string) {
    const userIds = await this.findIdsByRoleId(roleId);

    await this.userModel.updateOne(
      { roles: { $elemMatch: { _id: getObjectId(roleId) } } },
      { $pull: { roles: { _id: getObjectId(roleId) } } },
    );

    this.userStore.remove(userIds);
  }

  async deleteById(id: string) {
    await this.userModel.deleteOne({ _id: id }).exec();

    this.userStore.remove(id);
  }

  private async findIdsByRoleId(roleId: string) {
    const users = await this.userModel
      .find({ roles: { $elemMatch: { _id: getObjectId(roleId) } } }, { _id: 1 })
      .exec();
    return users.map((u) => u.id);
  }

  async countByEmail(email: string, excludeId?: string) {
    return this.userModel
      .countDocuments({ email, ...(excludeId ? { _id: { $ne: getObjectId(excludeId) } } : {}) })
      .exec();
  }

  findUserIdByCredentials(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase() }, { _id: 1, password: 1 }).exec();
  }

  async findById(id: string) {
    return this.userStore.get(id);
  }

  async findMetaDataByIds(ids: string[]) {
    if (!ids.length) return [];

    return this.userModel
      .find({ _id: { $in: ids } }, { _id: 1, firstName: 1, lastName: 1, email: 1, profileImage: 1 })
      .exec();
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
