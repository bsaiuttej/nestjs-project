import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RoleRepository } from 'src/roles/repositories/role.repository';
import { UsersGetDto } from '../dtos/user-get.dto';
import { CreateUserDto, UpdateUserDto } from '../dtos/user-post.dto';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly roleRepo: RoleRepository,
  ) {}

  async createUser(body: CreateUserDto) {
    const existingEmail = await this.userRepo.countByEmail(body.email);
    if (existingEmail) {
      throw new BadRequestException(`There is already a user with this email: ${body.email}`);
    }

    const roles = await this.roleRepo.findByIds(body.roleIds);
    if (roles.length !== body.roleIds.length) {
      throw new BadRequestException('Some roles were not found');
    }

    const user = this.userRepo.create(body);
    user.roles = roles;

    return this.userRepo.save(user);
  }

  async updateUser(id: string, body: UpdateUserDto) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingEmail = await this.userRepo.countByEmail(body.email, id);
    if (existingEmail) {
      throw new BadRequestException(`There is already a user with this email: ${body.email}`);
    }

    const roles = await this.roleRepo.findByIds(body.roleIds);
    if (roles.length !== body.roleIds.length) {
      throw new BadRequestException('Some roles were not found');
    }

    user.email = body.email;
    user.firstName = body.firstName;
    user.lastName = body.lastName;
    user.roles = roles;
    if (body.password) {
      user.password = body.password;
    }

    return this.userRepo.save(user);
  }

  async deleteUser(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepo.deleteById(id);
    return {
      message: 'User deleted successfully',
    };
  }

  async getUser(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getUsers(query: UsersGetDto) {
    return this.userRepo.find(query);
  }
}
