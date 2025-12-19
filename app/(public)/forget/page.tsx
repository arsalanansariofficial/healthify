'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { emailSchema } from '@/lib/schemas';
import { Input } from '@/components/ui/input';
import { forgetPassword } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';
import handler from '@/components/display-toast';

import {
  Form,
  FormItem,
  FormField,
  FormMessage,
  FormControl
} from '@/components/ui/form';

import {
  Empty,
  EmptyTitle,
  EmptyHeader,
  EmptyContent,
  EmptyDescription
} from '@/components/ui/empty';

export default function Page() {
  const { pending, handleSubmit } = useHookForm(handler, forgetPassword);

  const form = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: String() }
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
