'use client';

import z from 'zod';
import Link from 'next/link';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

import { login } from '@/lib/actions';
import { getDate } from '@/lib/utils';
import { SIGNUP } from '@/lib/constants';
import * as CN from '@/components/ui/card';
import { loginSchema } from '@/lib/schemas';
import * as RHF from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';

type Schema = z.infer<typeof loginSchema>;

export default function Page() {
  let oAuthError: string | undefined;
  const searchParams = useSearchParams();

  const { pending, handleSubmit } = useHookForm<Schema>(action);
  const form = useForm<Schema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: String(),
      password: String()
    }
  });

  if (searchParams.get('error') === 'OAuthAccountNotLinked') {
    oAuthError = '⚠️ Email already registered with another provider.';
  }

  async function action(data: Schema) {
    const result = await login(data);

    if (result?.success) {
      toast(result.message, {
        position: 'top-center',
        description: <span className="text-foreground">{getDate()}</span>
      });
    }

    if (oAuthError) {
      toast(<h2 className="text-destructive">{oAuthError}</h2>, {
        position: 'top-center',
        description: <p className="text-destructive">{getDate()}</p>
      });
    }

    if (!result?.success && result?.message) {
      toast(<h2 className="text-destructive">{result?.message}</h2>, {
        position: 'top-center',
        description: <p className="text-destructive">{getDate()}</p>
      });
    }
  }

  return (
    <section className="col-span-2 grid place-items-center gap-4 place-self-center">
      <CN.Card className="min-w-sm">
        <CN.CardHeader>
          <CN.CardTitle>Login to your account</CN.CardTitle>
          <CN.CardDescription>
            Enter your email below to login to your account
          </CN.CardDescription>
          <CN.CardAction>
            <Button variant="link">
              <Link href={SIGNUP}>Signup</Link>
            </Button>
          </CN.CardAction>
        </CN.CardHeader>
        <CN.CardContent>
          <RHF.Form {...form}>
            <form
              id="login-form"
              className="space-y-2"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <RHF.FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <RHF.FormItem>
                    <RHF.FormLabel>Email</RHF.FormLabel>
                    <RHF.FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="your.name@domain.com"
                      />
                    </RHF.FormControl>
                    <RHF.FormMessage />
                  </RHF.FormItem>
                )}
              />
              <RHF.FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <RHF.FormItem>
                    <RHF.FormLabel>password</RHF.FormLabel>
                    <RHF.FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Secret@123"
                      />
                    </RHF.FormControl>
                    <RHF.FormMessage />
                  </RHF.FormItem>
                )}
              />
            </form>
          </RHF.Form>
        </CN.CardContent>
        <CN.CardFooter className="grid gap-2">
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
            Login with GitHub
          </Button>
        </CN.CardFooter>
      </CN.Card>
    </section>
  );
}
