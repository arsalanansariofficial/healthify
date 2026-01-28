'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import handler from '@/components/display-toast';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardTitle,
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
  FormMessage,
  FormControl
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import useHookForm from '@/hooks/use-hook-form';
import { addPharmaCode } from '@/lib/actions';
import { pharmaCodeSchema } from '@/lib/schemas';

export default function Component() {
  const { handleSubmit } = useHookForm(handler, addPharmaCode);
  const form = useForm({
    defaultValues: { code: String(), description: String(), frequency: 1 },
    resolver: zodResolver(pharmaCodeSchema)
  });

  return (
    <div className='flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12'>
      <Card>
        <CardHeader>
          <CardTitle>Add RX Code</CardTitle>
          <CardDescription>
            Add details for <strong>RX</strong> here. Click save when
            you&apos;re done.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className='space-y-2'
              id='rx-form'
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                control={form.control}
                name='frequency'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <FormControl>
                      <Input
                        {...{ ...field, value: field.value as number }}
                        placeholder='1 tablet'
                        type='number'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input {...field} min={1} placeholder='Q4H' type='text' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...{ ...field, value: field.value as string }}
                        placeholder='Single dose every 4 hours'
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
          <Button
            className='cursor-pointer'
            disabled={form.formState.isLoading}
            form='rx-form'
            type='submit'
          >
            {form.formState.isLoading ? 'Saving...' : 'Save'}
          </Button>
        </CardFooter>
      </Card>
      <Footer />
    </div>
  );
}
