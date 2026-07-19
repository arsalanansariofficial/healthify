import {
  defaultStatements as defaultOrganizationStatements,
  defaultRoles as defaultOrganizationRoles
} from 'better-auth/plugins/organization/access';
import {
  defaultStatements as defaultAdminStatements,
  defaultRoles as defaultAdminRoles
} from 'better-auth/plugins/admin/access';
import { createAccessControl } from 'better-auth/plugins/access';

export type Permissions = Partial<{
  [K in keyof typeof ac.statements]: (typeof ac.statements)[K][number][];
}>;
export type Roles = keyof typeof permissions.roles;

const ac = createAccessControl({
  task: ['create', 'read', 'update', 'delete'],
  ...defaultOrganizationStatements,
  ...defaultAdminStatements
});

const user = ac.newRole({ task: ['create', 'read', 'update', 'delete'] });
const admin = ac.newRole(ac.statements);

export const permissions = {
  roles: {
    ...defaultOrganizationRoles,
    ...defaultAdminRoles,
    owner: admin,
    admin,
    user
  },
  ac
};
