'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { signup } from '@/lib/actions';
import { LOGIN } from '@/lib/constants';
import * as CN from '@/components/ui/card';
import * as RHF from '@/components/ui/form';
import { signupSchema } from '@/lib/schemas';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';
import handler from '@/components/display-toast';

export default function Page() {
  const { pending, handleSubmit } = useHookForm(handler, signup);

  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: String(),
      email: String(),
      password: String()
    }
  });

  return (
    <section className="col-span-2 grid place-items-center gap-4 place-self-center">
      <CN.Card className="min-w-sm">
        <CN.CardHeader>
          <CN.CardTitle>Create your account</CN.CardTitle>
          <CN.CardDescription>
            Enter your details below to create your account
          </CN.CardDescription>
          <CN.CardAction>
            <Button variant="link">
              <Link href={LOGIN}>Login</Link>
            </Button>
          </CN.CardAction>
        </CN.CardHeader>
        <CN.CardContent>
          <RHF.Form {...form}>
            <form
              id="signup-form"
              className="space-y-2"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <RHF.FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <RHF.FormItem>
                    <RHF.FormLabel>Name</RHF.FormLabel>
                    <RHF.FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Gwen Tennyson"
                      />
                    </RHF.FormControl>
                    <RHF.FormMessage />
                  </RHF.FormItem>
                )}
              />
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
                    <RHF.FormLabel>Password</RHF.FormLabel>
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
            form="signup-form"
            disabled={pending}
            className="cursor-pointer"
          >
            {pending ? 'Signing up...' : 'Signup'}
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
