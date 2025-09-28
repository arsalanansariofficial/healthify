'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Footer from '@/components/footer';
import { Input } from '@/components/ui/input';
import { addPermission } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';
import handler from '@/components/display-toast';
import { permissionSchema } from '@/lib/schemas';

import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';

import {
  Card,
  CardTitle,
  CardFooter,
  CardHeader,
  CardContent,
  CardDescription
} from '@/components/ui/card';

export default function Component() {
  const { pending, handleSubmit } = useHookForm(handler, addPermission);

  const form = useForm({
    resolver: zodResolver(permissionSchema),
    defaultValues: { name: String() }
  });

  return (
    <div className="flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12">
      <Card>
        <CardHeader>
          <CardTitle>Add permission</CardTitle>
          <CardDescription>
            Enter a name for a permission that you want to add
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              id="permission-form"
              className="space-y-2"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="VIEW:DASHBOARD"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={pending}
            form="permission-form"
            className="cursor-pointer"
          >
            {pending ? 'Adding permission...' : 'Add permission'}
          </Button>
        </CardFooter>
      </Card>
      <Footer />
    </div>
  );
}
