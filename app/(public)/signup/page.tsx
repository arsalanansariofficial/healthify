'use client';

import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub';
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
import { signup } from '@/lib/actions';
import { ROUTES } from '@/lib/constants';
import { signupSchema } from '@/lib/schemas';
import { getDate } from '@/lib/utils';

export default function Component() {
  const [pending, setPending] = useState(false);

  const form = useForm({
    defaultValues: { email: String(), name: String(), password: String() },
    resolver: zodResolver(signupSchema)
  });

  async function handleSubmit(data: z.infer<typeof signupSchema>) {
    setPending(true);
    const result = await signup(data);

    if (result?.success) {
      toast(result.message, {
        description: <span className='text-foreground'>{getDate()}</span>,
        position: 'top-center'
      });
    }

    if (!result?.success && result?.message) {
      toast(<h2 className='text-destructive'>{result?.message}</h2>, {
        description: <p className='text-destructive'>{getDate()}</p>,
        position: 'top-center'
      });
    }

    setPending(false);
  }

  return (
    <section>
      <Card className='min-w-sm'>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
          <CardAction>
            <Button variant='link'>
              <Link href={ROUTES.LOGIN}>Login</Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              id='signup-form'
              className='space-y-2'
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                name='name'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='text'
                        placeholder='Gwen Tennyson'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name='email'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
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
              <FormField
                name='password'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='password'
                        placeholder='Secret@123'
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
            type='submit'
            form='signup-form'
            disabled={pending}
            className='cursor-pointer'
          >
            {pending ? 'Signing up...' : 'Signup'}
          </Button>
          <Button
            variant='outline'
            className='cursor-pointer'
            onClick={() => signIn('github')}
          >
            <FontAwesomeIcon icon={faGithub} size='5x' />
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
