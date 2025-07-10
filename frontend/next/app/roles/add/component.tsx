'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { addRole } from '@/lib/actions';
import Footer from '@/components/footer';
import { roleSchema } from '@/lib/schemas';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';
import handler from '@/components/display-toast';

import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormMessage,
  FormControl
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
  const { pending, handleSubmit } = useHookForm(handler, addRole);

  const form = useForm({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: String() }
  });

  return (
    <div className="flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12">
      <Card>
        <CardHeader>
          <CardTitle>Add roles</CardTitle>
          <CardDescription>
            Enter a name for a role that you want to add
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              id="role-form"
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
                      <Input {...field} type="text" placeholder="USER" />
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
            form="role-form"
            disabled={pending}
            className="cursor-pointer"
          >
            {pending ? 'Adding role...' : 'Add role'}
          </Button>
        </CardFooter>
      </Card>
      <Footer />
    </div>
  );
}
