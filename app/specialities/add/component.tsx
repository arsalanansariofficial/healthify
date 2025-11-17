'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Footer from '@/components/footer';
import { nameSchema } from '@/lib/schemas';
import { addSpeciality } from '@/lib/actions';
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
  CardFooter,
  CardHeader,
  CardContent,
  CardDescription
} from '@/components/ui/card';

export default function Component() {
  const { pending, handleSubmit } = useHookForm(handler, addSpeciality);

  const form = useForm({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: String() }
  });

  return (
    <div className="flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12">
      <Card>
        <CardHeader>
          <CardTitle>Add Speciality</CardTitle>
          <CardDescription>
            Add new speciality here. Click save when you&apos;re done.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              id="speciality-form"
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
                        className="capitalize"
                        placeholder="Physician"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={pending} form="speciality-form">
            {pending ? 'Saving...' : 'Save'}
          </Button>
        </CardFooter>
      </Card>
      <Footer />
    </div>
  );
}
