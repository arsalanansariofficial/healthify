'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Facility, Hospital } from '@prisma/client';
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
import { addDepartment } from '@/lib/actions';
import { departmentSchema } from '@/lib/schemas';

export default function Component({
  facilities,
  hospitals
}: {
  hospitals: Pick<Hospital, 'id' | 'name'>[];
  facilities: Pick<Facility, 'id' | 'name'>[];
}) {
  const { handleSubmit } = useHookForm(handler, addDepartment);
  const form = useForm({
    defaultValues: { facilities: [], hospitals: [], name: String() },
    resolver: zodResolver(departmentSchema)
  });

  return (
    <div className='flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12'>
      <Card>
        <CardHeader>
          <CardTitle>Add Department</CardTitle>
          <CardDescription>
            Add details for the department here. Click save when you&apos;re
            done.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className='space-y-2'
              id='department-form'
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Cardiology' type='text' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='facilities'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facilities</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={facilities.map(f => ({
                          label: f.name || String(),
                          value: f.id
                        }))}
                        selectedValues={field.value}
                        setSelectedValues={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='hospitals'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hospitals</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={hospitals.map(h => ({
                          label: h.name || String(),
                          value: h.id
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
