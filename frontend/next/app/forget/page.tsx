'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import * as CN from '@/components/ui/card';
import * as RHF from '@/components/ui/form';
import { emailSchema } from '@/lib/schemas';
import { Input } from '@/components/ui/input';
import { forgetPassword } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';
import handler from '@/components/display-toast';

export default function Page() {
  const { pending, handleSubmit } = useHookForm(handler, forgetPassword);

  const form = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: String() }
  });

  return (
    <section className="col-span-2 grid place-items-center gap-4 place-self-center">
      <CN.Card className="min-w-sm">
        <CN.CardHeader>
          <CN.CardTitle>Reset your password</CN.CardTitle>
          <CN.CardDescription>
            Enter your email below to reset your password
          </CN.CardDescription>
        </CN.CardHeader>
        <CN.CardContent>
          <RHF.Form {...form}>
            <form
              id="reset-form"
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
            </form>
          </RHF.Form>
        </CN.CardContent>
        <CN.CardFooter className="grid gap-2">
          <Button
            type="submit"
            form="reset-form"
            disabled={pending}
            className="cursor-pointer"
          >
            {pending ? 'Sending...' : 'Send token'}
          </Button>
        </CN.CardFooter>
      </CN.Card>
    </section>
  );
}
