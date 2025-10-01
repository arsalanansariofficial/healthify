'use client';

import { useForm } from 'react-hook-form';
import useHookForm from '@/hooks/use-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import * as CN from '@/components/ui/card';
import * as RHF from '@/components/ui/form';
import { loginSchema } from '@/lib/schemas';
import { Input } from '@/components/ui/input';
import { updatePassword } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import handler from '@/components/display-toast';

export default function Component({ email }: { email: string }) {
  const { pending, handleSubmit } = useHookForm(handler, updatePassword);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email, password: String() }
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
              id='reset-form'
              className='space-y-2'
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <RHF.FormField
                name='password'
                control={form.control}
                render={({ field }) => (
                  <RHF.FormItem>
                    <RHF.FormLabel className='flex items-center justify-between'>
                      <span>Password</span>
                    </RHF.FormLabel>
                    <RHF.FormControl>
                      <Input
                        {...field}
                        type='password'
                        placeholder='Secret@123'
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
            type='submit'
            form='reset-form'
            disabled={pending}
            className='w-full cursor-pointer'
          >
            {pending ? 'Updating password...' : 'Reset password'}
          </Button>
        </CN.CardFooter>
      </CN.Card>
    </section>
  );
}
