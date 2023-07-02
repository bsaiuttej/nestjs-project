export type PermissionType = {
  id: string;
  name: string;
};

export const Permissions = {
  role_creation: {
    id: 'role_creation',
    name: 'Role Creation',
  },
  role_update: {
    id: 'role_update',
    name: 'Role Update',
  },
  role_deletion: {
    id: 'role_deletion',
    name: 'Role Deletion',
  },
  role_view: {
    id: 'role_view',
    name: 'Role View',
  },
};
