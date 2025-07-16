'use client';

import { toast } from 'sonner';
import { useActionState, useState } from 'react';
import { Permission, Role } from '@prisma/client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { cn, getDate } from '@/lib/utils';
import * as SCN from '@/components/ui/card';
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

  const actionState = useActionState(async function () {
    const result = await assignPermissions({
      role: props.roles.some(r => r.name === role)
        ? (role as string)
        : props.roles[0].name,
      permissions: assigned
    });

    if (result?.success) {
      toast(result.message, {
        position: 'top-center',
        description: <span className="text-foreground">{getDate()}</span>
      });
    }

    if (!result?.success && result?.message) {
      toast(<h2 className="text-destructive">{result?.message}</h2>, {
        position: 'top-center',
        description: <p className="text-destructive">{getDate()}</p>
      });
    }

    return result;
  }, undefined);

  const [action, pending] = [actionState[1], actionState[2]];

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
    <section className="col-span-2 grid place-items-center gap-4 place-self-center lg:col-start-2">
      <SCN.Card className="min-w-sm">
        <SCN.CardHeader>
          <SCN.CardTitle>Add permissions for a given role</SCN.CardTitle>
          <SCN.CardDescription>
            Select a given role from the dropdown and choose the permissions to
            assign to that role
          </SCN.CardDescription>
        </SCN.CardHeader>
        <SCN.CardContent>
          <form id="role-permissions-form" className="space-y-2">
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
          </form>
        </SCN.CardContent>
        <SCN.CardFooter>
          <Button
            type="submit"
            disabled={pending}
            formAction={action}
            form="role-permissions-form"
            className="w-full cursor-pointer"
          >
            {pending ? 'Assigning permissions...' : 'Assign permissions'}
          </Button>
        </SCN.CardFooter>
      </SCN.Card>
    </section>
  );
}
