import { Test, TestingModule } from '@nestjs/testing';
import { RoleRepository } from 'src/roles/repositories/role.repository';
import { CreateUserDto, UpdateUserDto } from '../dtos/user-post.dto';
import { UserRepository } from '../repositories/user.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  const userRepo: Partial<UserRepository> = {
    create: jest.fn().mockImplementation((data) => data),
    save: jest.fn().mockImplementation((user) => Promise.resolve(user)),
    findById: jest.fn().mockReturnValue(Promise.resolve(null)),
    find: jest.fn().mockReturnValue(Promise.resolve({ count: 0 })),
    countByEmail: jest.fn().mockReturnValue(Promise.resolve(0)),
    deleteById: () => Promise.resolve(),
  };
  const roleRepo: Partial<RoleRepository> = {
    findByIds: jest.fn().mockReturnValue(Promise.resolve([])),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UserRepository,
          useValue: userRepo,
        },
        {
          provide: RoleRepository,
          useValue: roleRepo,
        },
        UsersService,
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    const body: CreateUserDto = {
      email: 'sample1@gmail.com',
      firstName: 'Sample',
      lastName: 'User',
      password: 'password',
      roleIds: [],
    };

    it('should create a user', async () => {
      userRepo.countByEmail = jest.fn().mockReturnValue(Promise.resolve(0));

      const user = await service.createUser(body);
      expect(user.email).toEqual(body.email);
      expect(user.firstName).toEqual(body.firstName);
      expect(user.lastName).toEqual(body.lastName);
    });

    it('should throw an error if email already exists', async () => {
      userRepo.countByEmail = jest.fn().mockReturnValue(Promise.resolve(1));

      await expect(service.createUser(body)).rejects.toThrow(
        `There is already a user with this email: ${body.email}`,
      );
    });

    it('should throw an error if some roles were not found', async () => {
      userRepo.countByEmail = jest.fn().mockReturnValue(Promise.resolve(0));
      roleRepo.findByIds = jest.fn().mockReturnValue(Promise.resolve([]));
      const currentBody: CreateUserDto = { ...body, roleIds: ['id'] };

      await expect(service.createUser(currentBody)).rejects.toThrow('Some roles were not found');
    });
  });

  describe('updateUser', () => {
    const body: UpdateUserDto = {
      email: 'sample1@gmail.com',
      firstName: 'Sample',
      lastName: 'User',
      password: 'password',
      roleIds: [],
    };

    it('should update a user', async () => {
      userRepo.findById = jest.fn().mockReturnValue(Promise.resolve({}));
      userRepo.countByEmail = jest.fn().mockReturnValue(Promise.resolve(0));
      roleRepo.findByIds = jest.fn().mockReturnValue(Promise.resolve([]));

      const user = await service.updateUser('id', body);
      expect(user.email).toEqual(body.email);
      expect(user.firstName).toEqual(body.firstName);
      expect(user.lastName).toEqual(body.lastName);

      const checkPassword = body.password === user.password;
      expect(checkPassword).toBeTruthy();
    });

    it('should throw an error if user not found', async () => {
      userRepo.findById = jest.fn().mockReturnValue(Promise.resolve(null));

      await expect(service.updateUser('id', body)).rejects.toThrow('User not found');
    });

    it('should throw an error if email already exists', async () => {
      userRepo.findById = jest.fn().mockReturnValue(Promise.resolve({}));
      userRepo.countByEmail = jest.fn().mockReturnValue(Promise.resolve(1));

      await expect(service.updateUser('id', body)).rejects.toThrow(
        `There is already a user with this email: ${body.email}`,
      );
    });

    it('should throw an error if some roles were not found', async () => {
      userRepo.findById = jest.fn().mockReturnValue(Promise.resolve({}));
      userRepo.countByEmail = jest.fn().mockReturnValue(Promise.resolve(0));
      roleRepo.findByIds = jest.fn().mockReturnValue(Promise.resolve([]));

      const currentBody: UpdateUserDto = { ...body, roleIds: ['id'] };
      await expect(service.updateUser('id', currentBody)).rejects.toThrow(
        'Some roles were not found',
      );
    });

    it('should not update password if not provided', async () => {
      userRepo.findById = jest.fn().mockReturnValue(Promise.resolve({}));
      userRepo.countByEmail = jest.fn().mockReturnValue(Promise.resolve(0));
      roleRepo.findByIds = jest.fn().mockReturnValue(Promise.resolve([]));

      const currentBody: UpdateUserDto = { ...body, password: undefined };
      const user = await service.updateUser('id', currentBody);
      expect(user.email).toEqual(body.email);
      expect(user.firstName).toEqual(body.firstName);
      expect(user.lastName).toEqual(body.lastName);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      userRepo.findById = jest.fn().mockReturnValue(Promise.resolve({}));

      const user = await service.deleteUser('id');
      expect(user).toEqual({ message: 'User deleted successfully' });
    });

    it('should throw an error if user not found', async () => {
      userRepo.findById = jest.fn().mockReturnValue(Promise.resolve(null));

      await expect(service.deleteUser('id')).rejects.toThrow('User not found');
    });
  });

  describe('getUsers', () => {
    it('should return a list of users', async () => {
      userRepo.find = jest.fn().mockReturnValue(Promise.resolve({ count: 0, users: [] }));

      const users = await service.getUsers({});
      expect(users.count).toEqual(0);
    });
  });

  describe('getUser', () => {
    it('should return a user', async () => {
      userRepo.findById = jest.fn().mockReturnValue(Promise.resolve({}));

      const user = await service.getUser('id');
      expect(user).toBeDefined();
    });

    it('should throw an error if user not found', async () => {
      userRepo.findById = jest.fn().mockReturnValue(Promise.resolve(null));

      await expect(service.getUser('id')).rejects.toThrow('User not found');
    });
  });
});
