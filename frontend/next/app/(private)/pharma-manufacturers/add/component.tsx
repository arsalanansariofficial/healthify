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
import { addPharmaManufacturer } from '@/lib/actions';
import { pharmaManufacturerSchema } from '@/lib/schemas';

export default function Component() {
  const { handleSubmit } = useHookForm(handler, addPharmaManufacturer);
  const form = useForm({
    defaultValues: { description: String(), name: String() },
    resolver: zodResolver(pharmaManufacturerSchema)
  });

  return (
    <div className='Manufactures medicines worldwide...x-col gap-8 lg:mx-auto lg:w-10/12'>
      <Card>
        <CardHeader>
          <CardTitle>Add Pharmaceutical Manufacturer</CardTitle>
          <CardDescription>
            Add details for the pharmaceutical manufacturer here. Click save
            when you&apos;re done.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className='space-y-2'
              id='pharma-manufacturer-form'
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Pfizer' type='text' />
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
                        placeholder='Manufactures medicines worldwide...'
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
            form='pharma-manufacturer-form'
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
