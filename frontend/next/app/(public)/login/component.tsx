'use client';

import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardTitle,
  CardAction,
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
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { login } from '@/lib/actions';
import { ROUTES } from '@/lib/constants';
import { loginSchema } from '@/lib/schemas';
import { getDate } from '@/lib/utils';

export default function Component({ error }: { error?: string }) {
  const [pending, setPending] = useState(false);

  const form = useForm({
    defaultValues: { email: String(), password: String() },
    resolver: zodResolver(loginSchema)
  });

  async function handleSubmit(data: z.infer<typeof loginSchema>) {
    setPending(true);
    const result = await login(data);

    if (error)
      toast(<h2 className='text-destructive'>{error}</h2>, {
        description: <p className='text-destructive'>{getDate()}</p>,
        position: 'top-center'
      });

    if (result?.success)
      toast(result.message, {
        description: <span className='text-foreground'>{getDate()}</span>,
        position: 'top-center'
      });

    if (!result?.success && result?.message)
      toast(<h2 className='text-destructive'>{result?.message}</h2>, {
        description: <p className='text-destructive'>{getDate()}</p>,
        position: 'top-center'
      });

    setPending(false);
  }

  return (
    <section>
      <Card className='min-w-sm'>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
          <CardAction>
            <Button variant='link'>
              <Link href={ROUTES.SIGNUP}>Signup</Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className='space-y-2'
              id='login-form'
              onSubmit={form.handleSubmit(handleSubmit)}>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
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
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center justify-between'>
                      <span>Password</span>
                      <Link
                        className='text-primary font-normal'
                        href={ROUTES.FORGET}>
                        Forget Password?
                      </Link>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Secret@123'
                        type='password'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter className='grid gap-2'>
          <Button
            className='cursor-pointer'
            disabled={pending}
            form='login-form'
            type='submit'>
            {pending ? 'Logging in...' : 'Login'}
          </Button>
          <Button
            className='cursor-pointer'
            onClick={() => signIn('github')}
            variant='outline'>
            <FontAwesomeIcon icon={faGithub} size='5x' />
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
