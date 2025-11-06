'use client';

import { User } from 'next-auth';
import { Role } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import Footer from '@/components/footer';
import * as SCN from '@/components/ui/card';
import * as RHF from '@/components/ui/form';
import * as CN from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';
import handler from '@/components/display-toast';
import { assignPermissions } from '@/lib/actions';
import { rolePermissionsSchema } from '@/lib/schemas';
import MultiSelect from '@/components/ui/multi-select';

type Props = {
  user: User;
  roles: Role[];
  assigned: string[];
  role: string | undefined;
  permissions: { label: string; value: string }[];
};

export default function Component(props: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const role = props.role ?? props.roles[0].name;
  const { pending, handleSubmit } = useHookForm(
    handler,
    assignPermissions,
    true
  );

  const form = useForm({
    resolver: zodResolver(rolePermissionsSchema),
    defaultValues: {
      permissions: props.assigned,
      name: props.roles.some(r => r.name === role) ? role : props.roles[0].name
    }
  });

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams);

    params.set(key, value);
    router.push(`${pathname}?${params}`);
  }

  return (
    <div className="flex flex-col h-full lg:mx-auto lg:w-10/12">
      <SCN.Card>
        <SCN.CardHeader>
          <SCN.CardTitle>Add permissions for a given role</SCN.CardTitle>
          <SCN.CardDescription>
            Select a given role from the dropdown and choose the permissions to
            assign to that role
          </SCN.CardDescription>
        </SCN.CardHeader>
        <SCN.CardContent>
          <RHF.Form {...form}>
            <form
              className="space-y-2"
              id="role-permissions-form"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <RHF.FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <RHF.FormItem>
                    <RHF.FormLabel>Role</RHF.FormLabel>
                    <RHF.FormControl>
                      <CN.Select
                        name="role"
                        value={field.value}
                        onValueChange={role => {
                          field.onChange(role);
                          updateParam('role', role);
                        }}
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
                    </RHF.FormControl>
                    <RHF.FormMessage />
                  </RHF.FormItem>
                )}
              />
              <RHF.FormField
                name="permissions"
                control={form.control}
                render={({ field }) => (
                  <RHF.FormItem>
                    <RHF.FormLabel>Role</RHF.FormLabel>
                    <RHF.FormControl>
                      <MultiSelect
                        options={props.permissions}
                        selectedValues={field.value}
                        setSelectedValues={field.onChange}
                        placeholder="Select permissions..."
                      />
                    </RHF.FormControl>
                    <RHF.FormMessage />
                  </RHF.FormItem>
                )}
              />
            </form>
          </RHF.Form>
        </SCN.CardContent>
        <SCN.CardFooter>
          <Button
            type="submit"
            disabled={pending}
            className="cursor-pointer"
            form="role-permissions-form"
          >
            {pending ? 'Assigning permissions...' : 'Assign permissions'}
          </Button>
        </SCN.CardFooter>
      </SCN.Card>
      <Footer />
    </div>
  );
}
