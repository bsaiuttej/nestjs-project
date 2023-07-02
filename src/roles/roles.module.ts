import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from 'src/users/users.module';
import { RolesController } from './controllers/roles.controller';
import { RoleRepository } from './repositories/role.repository';
import { Role, RoleSchema } from './schemas/role.schema';
import { RolesService } from './services/roles.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    forwardRef(() => UsersModule),
  ],
  controllers: [RolesController],
  providers: [RoleRepository, RolesService],
  exports: [RoleRepository, RolesService],
})
export class RolesModule {}
