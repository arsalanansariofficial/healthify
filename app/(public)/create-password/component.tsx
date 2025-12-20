'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import handler from '@/components/display-toast';
import { Button } from '@/components/ui/button';
import * as CN from '@/components/ui/card';
import * as RHF from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import useHookForm from '@/hooks/use-hook-form';
import { updatePassword } from '@/lib/actions';
import { loginSchema } from '@/lib/schemas';

export default function Component({ email }: { email: string }) {
  const { handleSubmit, pending } = useHookForm(handler, updatePassword);

  const form = useForm({
    defaultValues: { email, password: String() },
    resolver: zodResolver(loginSchema)
  });

  return (
    <section>
      <CN.Card className='min-w-sm'>
        <CN.CardHeader>
          <CN.CardTitle>Reset your password</CN.CardTitle>
          <CN.CardDescription>
            Enter a new password below to reset your account&apos;s password
          </CN.CardDescription>
        </CN.CardHeader>
        <CN.CardContent>
          <RHF.Form {...form}>
            <form
              className='space-y-2'
              id='reset-form'
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <RHF.FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <RHF.FormItem>
                    <RHF.FormLabel className='flex items-center justify-between'>
                      <span>Password</span>
                    </RHF.FormLabel>
                    <RHF.FormControl>
                      <Input
                        {...field}
                        placeholder='Secret@123'
                        type='password'
                      />
                    </RHF.FormControl>
                    <RHF.FormMessage />
                  </RHF.FormItem>
                )}
              />
            </form>
          </RHF.Form>
        </CN.CardContent>
        <CN.CardFooter>
          <Button
            className='w-full cursor-pointer'
            disabled={pending}
            form='reset-form'
            type='submit'
          >
            {pending ? 'Updating password...' : 'Reset password'}
          </Button>
        </CN.CardFooter>
      </CN.Card>
    </section>
  );
}
