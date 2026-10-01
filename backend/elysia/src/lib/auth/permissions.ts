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
  appointment: ['create', 'read', 'update', 'delete', 'confirm', 'cancel'],
  ...defaultOrganizationStatements,
  ...defaultAdminStatements
});

const doctor = ac.newRole({ appointment: ['read', 'confirm', 'cancel'] });
const user = ac.newRole({ appointment: ['create', 'read', 'cancel'] });
const admin = ac.newRole(ac.statements);

export const permissions = {
  roles: {
    ...defaultOrganizationRoles,
    ...defaultAdminRoles,
    owner: admin,
    doctor,
    admin,
    user
  },
  ac
};

export const Roles = Object.keys(permissions.roles) as Roles[];
