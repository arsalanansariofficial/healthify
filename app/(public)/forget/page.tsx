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
              id='reset-form'
              className='space-y-2'
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                name='email'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        type='email'
                        placeholder='your.name@domain.com'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type='submit'
                form='reset-form'
                disabled={pending}
                className='cursor-pointer'
              >
                {pending ? 'Sending...' : 'Send token'}
              </Button>
            </form>
          </Form>
        </EmptyContent>
      </Empty>
    </section>
  );
}
