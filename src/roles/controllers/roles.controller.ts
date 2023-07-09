import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import { RolePostDto, RolesGetDto } from '../dtos/roles.dto';
import { RolesService } from '../services/roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Post()
  createRole(@Body() body: RolePostDto) {
    return this.service.createRole(body);
  }

  @Put(':id')
  updateRole(@Body() body: RolePostDto, @Param('id', ParseObjectIdPipe) id: string) {
    return this.service.updateRole(id, body);
  }

  @Get(':id')
  getRole(@Param('id', ParseObjectIdPipe) id: string) {
    return this.service.getRole(id);
  }

  @Get()
  getRoles(@Query() query: RolesGetDto) {
    return this.service.getRoles(query);
  }

  @Delete(':id')
  deleteRole(@Param('id', ParseObjectIdPipe) id: string) {
    return this.service.deleteRole(id);
  }
}
