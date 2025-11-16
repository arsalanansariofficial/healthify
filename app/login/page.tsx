'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { login } from '@/lib/actions';
import { loginSchema } from '@/lib/schemas';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';
import handler from '@/components/display-toast';
import { FORGET, SIGNUP, EMAIL_REGISTERED } from '@/lib/constants';

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
  CardAction,
  CardFooter,
  CardHeader,
  CardContent,
  CardDescription
} from '@/components/ui/card';

export default function Page() {
  let oAuthError: string | undefined;
  const searchParams = useSearchParams();
  const { pending, handleSubmit } = useHookForm(
    handler,
    login,
    false,
    oAuthError
  );

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: String(), password: String() }
  });

  if (searchParams.get('error') === 'OAuthAccountNotLinked') {
    oAuthError = EMAIL_REGISTERED;
  }

  return (
    <main className="row-start-2 mx-8 grid place-items-center">
      <section>
        <Card className="min-w-sm">
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
            <CardAction>
              <Button variant="link">
                <Link href={SIGNUP}>Signup</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                id="login-form"
                className="space-y-2"
                onSubmit={form.handleSubmit(handleSubmit)}
              >
                <FormField
                  name="email"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="your.name@domain.com"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="password"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center justify-between">
                        <span>Password</span>
                        <Link
                          href={FORGET}
                          className="text-primary font-normal"
                        >
                          Forget Password?
                        </Link>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Secret@123"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
          <CardFooter className="grid gap-2">
            <Button
              type="submit"
              form="login-form"
              disabled={pending}
              className="cursor-pointer"
            >
              {pending ? 'Logging in...' : 'Login'}
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => signIn('github')}
            >
              <FontAwesomeIcon icon={faGithub} size="5x" />
            </Button>
          </CardFooter>
        </Card>
      </section>
    </main>
  );
}
