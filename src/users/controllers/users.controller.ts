import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import { UsersGetDto } from '../dtos/user-get.dto';
import { CreateUserDto, UpdateUserDto } from '../dtos/user-post.dto';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Post()
  createUser(@Body() body: CreateUserDto) {
    return this.service.createUser(body);
  }

  @Put(':id')
  updateUser(@Body() body: UpdateUserDto, @Param('id', ParseObjectIdPipe) id: string) {
    return this.service.updateUser(id, body);
  }

  @Get(':id')
  getUser(@Param('id', ParseObjectIdPipe) id: string) {
    return this.service.getUser(id);
  }

  @Get()
  getUsers(@Query() query: UsersGetDto) {
    return this.service.getUsers(query);
  }

  @Delete(':id')
  deleteUser(@Param('id', ParseObjectIdPipe) id: string) {
    return this.service.deleteUser(id);
  }
}
