'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Department } from '@prisma/client';
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
import MultiSelect from '@/components/ui/multi-select';
import useHookForm from '@/hooks/use-hook-form';
import { addFacility } from '@/lib/actions';
import { facilitySchema } from '@/lib/schemas';

export default function Component({
  departments
}: {
  departments: Pick<Department, 'id' | 'name'>[];
}) {
  const { handleSubmit } = useHookForm(handler, addFacility);
  const form = useForm({
    defaultValues: { departments: [], name: String() },
    resolver: zodResolver(facilitySchema)
  });

  return (
    <div className='flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12'>
      <Card>
        <CardHeader>
          <CardTitle>Add Facility</CardTitle>
          <CardDescription>
            Add details for the facility here. Click save when you&apos;re done.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className='space-y-2'
              id='department-form'
              onSubmit={form.handleSubmit(handleSubmit)}>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='ECG' type='text' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='departments'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departments</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={departments.map(d => ({
                          label: d.name || String(),
                          value: d.id
                        }))}
                        selectedValues={field.value}
                        setSelectedValues={field.onChange}
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
            form='department-form'
            type='submit'>
            {form.formState.isLoading ? 'Saving...' : 'Save'}
          </Button>
        </CardFooter>
      </Card>
      <Footer />
    </div>
  );
}
