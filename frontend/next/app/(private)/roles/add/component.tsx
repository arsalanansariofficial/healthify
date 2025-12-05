'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import handler from '@/components/display-toast';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardTitle,
  CardFooter,
  CardHeader,
  CardContent,
  CardDescription
} from '@/components/ui/card';
import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormMessage,
  FormControl
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import useHookForm from '@/hooks/use-hook-form';
import { addRole } from '@/lib/actions';
import { roleSchema } from '@/lib/schemas';

export default function Component() {
  const { handleSubmit, pending } = useHookForm(handler, addRole);

  const form = useForm({
    defaultValues: { name: String() },
    resolver: zodResolver(roleSchema)
  });

  return (
    <div className='flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12'>
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
              className='space-y-2'
              id='role-form'
              onSubmit={form.handleSubmit(handleSubmit)}>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='USER' type='text' />
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
            className='cursor-pointer'
            disabled={pending}
            form='role-form'
            type='submit'>
            {pending ? 'Adding role...' : 'Add role'}
          </Button>
        </CardFooter>
      </Card>
      <Footer />
    </div>
  );
}
