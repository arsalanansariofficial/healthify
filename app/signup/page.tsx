'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub';

import { signup } from '@/lib/actions';
import { LOGIN } from '@/lib/constants';
import { signupSchema } from '@/lib/schemas';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';
import handler from '@/components/display-toast';

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
    <main className="row-start-2 mx-8 grid place-items-center">
      <section>
        <Card className="min-w-sm">
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Enter your details below to create your account
            </CardDescription>
            <CardAction>
              <Button variant="link">
                <Link href={LOGIN}>Login</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                id="signup-form"
                className="space-y-2"
                onSubmit={form.handleSubmit(handleSubmit)}
              >
                <FormField
                  name="name"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Gwen Tennyson"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                      <FormLabel>Password</FormLabel>
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
              <FontAwesomeIcon icon={faGithub} size="5x" />
            </Button>
          </CardFooter>
        </Card>
      </section>
    </main>
  );
}
