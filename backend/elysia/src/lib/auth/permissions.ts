import {
  defaultStatements,
  defaultRoles
} from 'better-auth/plugins/admin/access';
import { createAccessControl } from 'better-auth/plugins/access';

const ac = createAccessControl({
  ...defaultStatements,
  task: ['create', 'update', 'delete']
});

const user = ac.newRole({ task: ['create', 'update', 'delete'] });
const admin = ac.newRole(ac.statements);

export const permissions = { roles: { ...defaultRoles, admin, user }, ac };
