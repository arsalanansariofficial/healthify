'use client';

import z from 'zod';
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
import { FORGET, SIGNUP, EMAIL_REGISTERED, LOGIN } from '@/lib/constants';

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

  const params = useSearchParams();
  const error = params.get('error');
  const redirectTo = params.get('redirectTo') || String();

  const { pending, handleSubmit } = useHookForm(
    handler,
    (data: z.infer<typeof loginSchema>) => login(data, redirectTo),
    false,
    oAuthError
  );

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: String(), password: String() }
  });

  if (error === 'OAuthAccountNotLinked') {
    oAuthError = EMAIL_REGISTERED;
  }

  return (
    <>
      <header className="sticky top-0 z-30 px-8 py-4 backdrop-blur-xs">
        <div className="grid grid-cols-[1fr_auto] gap-4">
          <div className="grid grid-flow-col grid-cols-[auto_1fr] items-center gap-4">
            <Link
              href={LOGIN}
              className="hover:bg-accent relative hidden aspect-square rounded-md p-4 lg:block"
            >
              <span className="absolute top-1/2 left-1/2 mt-0.5 ml-0.5 grid min-w-5 -translate-x-1/2 -translate-y-1/2 -rotate-45 gap-1">
                <span className="bg-primary h-1 w-full rounded-md" />
                <span className="bg-primary h-1 w-1/2 justify-self-center rounded-md" />
              </span>
            </Link>
          </div>
        </div>
      </header>
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
    </>
  );
}
