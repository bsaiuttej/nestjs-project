import { Test, TestingModule } from '@nestjs/testing';
import { RoleRepository } from '../repositories/role.repository';
import { RolesService } from './roles.service';

describe('RolesService', () => {
  let service: RolesService;
  const mockRoleRepository: Partial<RoleRepository> = {
    create: jest.fn().mockImplementation((data) => data),
    save: jest.fn().mockImplementation((role) => Promise.resolve(role)),
    countByName: jest.fn().mockReturnValue(Promise.resolve(0)),
    findById: jest.fn().mockReturnValue(Promise.resolve(null)),
    find: jest.fn().mockReturnValue(Promise.resolve({ count: 0, roles: [] })),
    deleteById: jest.fn().mockReturnValue(Promise.resolve(null)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: RoleRepository,
          useValue: mockRoleRepository,
        },
        RolesService,
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRole', () => {
    const body = { name: 'test', permissions: [] };

    it('should throw error when invalid permissions are provided', async () => {
      const currentBody = { ...body, permissions: ['invalid'] };

      await expect(service.createRole(currentBody)).rejects.toThrow(
        `Invalid permissions: ${currentBody.permissions.join(', ')}`,
      );
    });

    it('should create role', async () => {
      const role = await service.createRole(body);
      expect(role).toEqual(body);
    });

    it('should throw error when role with same name already exists', async () => {
      mockRoleRepository.countByName = jest.fn().mockReturnValue(Promise.resolve(1));

      await expect(service.createRole(body)).rejects.toThrow(
        `There is already a role with the same name you have entered, '${body.name}'`,
      );
    });
  });

  describe('updateRole', () => {
    const body = { name: 'test', permissions: [] };

    it('should throw error when invalid permissions are provided', async () => {
      const currentBody = { ...body, permissions: ['invalid'] };

      await expect(service.updateRole('id', currentBody)).rejects.toThrow(
        `Invalid permissions: ${currentBody.permissions.join(', ')}`,
      );
    });

    it('should throw error when role does not exist', async () => {
      await expect(service.updateRole('id', body)).rejects.toThrow('Role not found');
    });

    it('should update role', async () => {
      mockRoleRepository.findById = jest
        .fn()
        .mockReturnValue(Promise.resolve({ ...body, permissions: [] }));
      mockRoleRepository.countByName = jest.fn().mockReturnValue(Promise.resolve(0));

      const role = await service.updateRole('id', body);
      expect(role).toEqual(body);
    });

    it('should throw error when role with same name already exists', async () => {
      mockRoleRepository.countByName = jest.fn().mockReturnValue(Promise.resolve(1));

      await expect(service.updateRole('id', body)).rejects.toThrow(
        `There is already a role with the same name you have entered, '${body.name}'`,
      );
    });
  });

  describe('deleteRole', () => {
    it('should delete role', async () => {
      mockRoleRepository.findById = jest.fn().mockReturnValue(Promise.resolve({ name: 'test' }));

      const role = await service.deleteRole('id');
      expect(role).toEqual({ message: 'Role deleted successfully' });
    });

    it('should throw error when role does not exist', async () => {
      mockRoleRepository.findById = jest.fn().mockReturnValue(Promise.resolve(null));

      await expect(service.deleteRole('id')).rejects.toThrow('Role not found');
    });
  });

  describe('getRoles', () => {
    it('should return roles', async () => {
      const roles = await service.getRoles({});
      expect(roles).toEqual({ count: 0, roles: [] });
    });

    it('should return roles with pagination', async () => {
      mockRoleRepository.find = jest.fn().mockReturnValue(
        Promise.resolve({
          count: 1,
          roles: [
            {
              name: 'test',
              permissions: [],
            },
          ],
        }),
      );

      const roles = await service.getRoles({});
      expect(roles.count).toEqual(1);
    });
  });

  describe('getRole', () => {
    it('should return role', async () => {
      mockRoleRepository.findById = jest.fn().mockReturnValue(Promise.resolve({ name: 'test' }));

      const role = await service.getRole('id');
      expect(role).toEqual({ name: 'test' });
    });

    it('should throw error when role does not exist', async () => {
      mockRoleRepository.findById = jest.fn().mockReturnValue(Promise.resolve(null));

      await expect(service.getRole('id')).rejects.toThrow('Role not found');
    });
  });
});
