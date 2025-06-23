'use client';

import { useActionState, useState } from 'react';
import { Permission, Role } from '@prisma/client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { cn } from '@/lib/utils';
import * as CN from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { assignPermissions } from '@/lib/actions';

type Props = {
  roles: Role[];
  assigned: null | undefined | Permission[];
  permissions: null | undefined | Permission[];
};

export default function Component(props: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const searchParams = useSearchParams();
  const selectedRole = searchParams.get('role') ?? props.roles[0].name;

  const [role, setRole] = useState<string | undefined>(selectedRole);
  const [assigned, setAssigned] = useState<Permission[]>(props.assigned ?? []);

  const [state, action, pending] = useActionState(
    assignPermissions.bind(null, {
      role: role as string,
      permissions: assigned
    }),
    undefined
  );

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams);

    params.set(key, value);
    router.push(`${pathname}?${params}`);
  }

  function getSelected(permission: Permission) {
    const selected = assigned.find(assignedPermission => {
      return assignedPermission.id === permission.id;
    });

    return selected ? 'bg-secondary' : 'bg-transparent';
  }

  function toggleAssignment(permission: Permission): void {
    const selected = assigned.find(assignedPermission => {
      return assignedPermission.id === permission.id;
    });

    if (selected) {
      return setAssigned(permissions => {
        return permissions.filter(permission => permission.id !== selected.id);
      });
    }

    setAssigned(permissions => [permission, ...permissions]);
  }

  return (
    <main className="row-start-2 grid place-items-center">
      <section className="grid place-items-center p-4">
        <form
          action={action}
          className="min-w-sm space-y-4 rounded-md border border-dashed p-4 shadow"
        >
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <CN.Select
              name="role"
              onValueChange={role => {
                setRole(role);
                updateParam('role', role);
              }}
              value={
                props.roles.some(r => r.name === role)
                  ? role
                  : props.roles[0].name
              }
            >
              <CN.SelectTrigger className="w-full">
                <CN.SelectValue placeholder="Select a role" />
              </CN.SelectTrigger>
              <CN.SelectContent>
                {props.roles.map(role => (
                  <CN.SelectItem key={role.id} value={role.name}>
                    {role.name}
                  </CN.SelectItem>
                ))}
              </CN.SelectContent>
            </CN.Select>
          </div>
          {props.permissions && props.permissions.length > 0 && (
            <div>
              <ul className="space-y-2">
                {props.permissions.map(permission => {
                  return (
                    <li
                      key={permission.id}
                      onClick={() => toggleAssignment(permission)}
                      className={cn(
                        getSelected(permission),
                        'cursor-pointer rounded-md border p-2 text-center text-sm font-medium lowercase shadow-xs'
                      )}
                    >
                      {permission.name}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {state?.message && (
            <p className="text-destructive text-xs">{state.message}</p>
          )}
          <Button
            type="submit"
            disabled={pending}
            className="w-full cursor-pointer"
          >
            {pending ? 'Adding permissions...' : 'Add permissions'}
          </Button>
        </form>
      </section>
    </main>
  );
}
