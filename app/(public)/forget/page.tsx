'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import handler from '@/components/display-toast';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyTitle,
  EmptyHeader,
  EmptyContent,
  EmptyDescription
} from '@/components/ui/empty';
import {
  Form,
  FormItem,
  FormField,
  FormMessage,
  FormControl
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import useHookForm from '@/hooks/use-hook-form';
import { forgetPassword } from '@/lib/actions';
import { emailSchema } from '@/lib/schemas';

export default function Page() {
  const { handleSubmit, pending } = useHookForm(handler, forgetPassword);

  const form = useForm({
    defaultValues: { email: String() },
    resolver: zodResolver(emailSchema)
  });

  return (
    <section>
      <Empty className='min-w-sm'>
        <EmptyHeader>
          <EmptyTitle>Reset your password</EmptyTitle>
          <EmptyDescription>
            Enter your email below to reset your password
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Form {...form}>
            <form
              className='space-y-2'
              id='reset-form'
              onSubmit={form.handleSubmit(handleSubmit)}>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='your.name@domain.com'
                        type='email'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                className='cursor-pointer'
                disabled={pending}
                form='reset-form'
                type='submit'>
                {pending ? 'Sending...' : 'Send token'}
              </Button>
            </form>
          </Form>
        </EmptyContent>
      </Empty>
    </section>
  );
}
