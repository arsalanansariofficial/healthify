'use client';

import { Role } from '@prisma/client';
import { useActionState, useState } from 'react';

import { cn } from '@/lib/utils';
import { User } from '@/lib/types';
import { assignRoles } from '@/lib/actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Props = { user: User; roles: Role[] };

export default function Component({ user, roles }: Props) {
  const [assigned, setAssigned] = useState<Role[]>(user.roles);

  const [state, action, pending] = useActionState(
    assignRoles.bind(null, { roles: assigned, id: user.id as string }),
    undefined
  );

  function getSelected(role: Role) {
    const selected = assigned.find(assignedRole => {
      return role.id === assignedRole.id;
    });

    return selected ? 'bg-secondary' : 'bg-transparent';
  }

  function toggleAssignment(role: Role): void {
    const selected = assigned.find(assignedRole => {
      return role.id === assignedRole.id;
    });

    if (selected) {
      return setAssigned(roles => {
        return roles.filter(role => role.id !== selected.id);
      });
    }

    setAssigned(roles => [role, ...roles]);
  }

  return (
    <section className="col-span-2 grid place-items-center place-self-center p-4 lg:col-start-2">
      <form
        action={action}
        className="min-w-sm space-y-4 rounded-md border border-dashed p-4 shadow"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            disabled
            id="name"
            name="name"
            type="text"
            value={user.name as string}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            disabled
            id="email"
            name="email"
            type="email"
            value={user.email as string}
          />
        </div>
        <div className="space-y-2">
          <Label id="roles">Roles</Label>
          <ul id="roles" className="space-y-2">
            {roles.map(role => {
              return (
                <li
                  key={role.id}
                  onClick={() => toggleAssignment(role)}
                  className={cn(
                    getSelected(role),
                    'cursor-pointer rounded-md border p-2 text-center text-sm font-medium lowercase shadow-xs'
                  )}
                >
                  {role.name}
                </li>
              );
            })}
          </ul>
        </div>
        {state?.message && (
          <p className="text-destructive text-xs">{state.message}</p>
        )}
        <Button
          type="submit"
          disabled={pending}
          className="w-full cursor-pointer"
        >
          {pending ? 'Adding role...' : 'Add Role'}
        </Button>
      </form>
    </section>
  );
}
