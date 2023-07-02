import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { keyBy, uniq } from 'lodash';
import { RolePostDto, RolesGetDto } from '../dtos/roles.dto';
import { RoleRepository } from '../repositories/role.repository';
import { Permissions } from '../schemas/permissions';

@Injectable()
export class RolesService {
  constructor(private readonly roleRepo: RoleRepository) {}

  async createRole(body: RolePostDto) {
    const permissions = this.checkPermissions(body.permissions);
    const existingName = await this.roleRepo.countByName(body.name);
    if (existingName) {
      throw new BadRequestException(`Role with name ${body.name} already exists`);
    }

    const role = this.roleRepo.create(body);
    role.permissions = permissions.map((p) => ({ permissionId: p, addedAt: new Date() }));
    return this.roleRepo.save(role);
  }

  async updateRole(id: string, body: RolePostDto) {
    const permissions = this.checkPermissions(body.permissions);

    const role = await this.roleRepo.findById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const existingName = await this.roleRepo.countByName(body.name, id);
    if (existingName) {
      throw new BadRequestException(`Role with name ${body.name} already exists`);
    }

    const prevPermissions = keyBy(role.permissions, (v) => v.permissionId);
    role.name = body.name;
    role.permissions = permissions.map((p) => {
      const prev = prevPermissions[p];
      return {
        permissionId: p,
        addedAt: prev?.addedAt || new Date(),
      };
    });

    return this.roleRepo.save(role);
  }

  checkPermissions(permissions: string[]) {
    const invalidPermissions = permissions.filter((p) => !Permissions[p]);
    if (invalidPermissions.length) {
      throw new BadRequestException(`Invalid permissions: ${invalidPermissions.join(', ')}`);
    }

    return uniq(permissions).sort();
  }

  async deleteRole(id: string) {
    const role = await this.roleRepo.findById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    await this.roleRepo.deleteById(id);
    return { message: 'Role deleted successfully' };
  }

  async getRole(id: string) {
    const role = await this.roleRepo.findById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async getRoles(query: RolesGetDto) {
    return this.roleRepo.find(query);
  }
}
