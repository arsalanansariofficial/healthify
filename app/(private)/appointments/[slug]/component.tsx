'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AppointmentStatus, Facility, Hospital, Prisma } from '@prisma/client';
import { User as AuthUser } from 'next-auth';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';

import handler from '@/components/display-toast';
import Footer from '@/components/footer';
import TableUpload from '@/components/table-upload';
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
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import MultiSelect from '@/components/ui/multi-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import useHookForm from '@/hooks/use-hook-form';
import { updateAppointment } from '@/lib/actions';
import { FILES } from '@/lib/constants';
import { appointmentSummarySchema } from '@/lib/schemas';
import { capitalize, formatTime, getDate } from '@/lib/utils';

export default function Component({
  appointment,
  facilities,
  hospitals
}: {
  user: AuthUser;
  hospitals: Hospital[];
  facilities: Facility[];
  appointment: Prisma.AppointmentGetPayload<{
    include: {
      doctor: true;
      patient: true;
      timeSlot: true;
      facilities: true;
      benificiary: true;
      prescriptions: true;
      appointmentHospitals: true;
    };
  }>;
}) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const { handleSubmit, pending } = useHookForm(
    handler,
    updateAppointment.bind(null, appointment.id) as (
      data: unknown
    ) => Promise<unknown>
  );

  const form = useForm({
    defaultValues: {
      appointmentHospitals: appointment.appointmentHospitals.map(
        ah => ah.hospitalId
      ),
      benificiaryId: appointment.benificiary?.id || String(),
      city: appointment.city,
      date: appointment.date,
      doctorId: appointment.doctor.id,
      email: appointment.email,
      facilities: appointment.facilities.map(f => f.id),
      isReferred: appointment.isReferred ? 'yes' : 'no',
      name: appointment.name,
      notes: capitalize(appointment.notes || String()),
      patientId: appointment.patient.id,
      phone: appointment.phone,
      prescriptions: appointment.prescriptions.map(p => p.id),
      reports: appointment.reports,
      status: appointment.status,
      timeSlotId: appointment.timeSlot.id
    },
    resolver: zodResolver(appointmentSummarySchema)
  });

  return (
    <div className='flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12'>
      <Card>
        <CardHeader>
          <CardTitle>Appointment Summary</CardTitle>
          <CardDescription>
            You can update appointment details here, click save when you&apos;re
            done.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className='space-y-4 lg:grid lg:grid-cols-2 lg:gap-4'
              id='appointment-form'
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                control={form.control}
                name='doctorId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className='capitalize'
                        disabled
                        placeholder='Gwen Tennyson'
                        type='text'
                        value={appointment.doctor.name || String()}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className='capitalize'
                        disabled
                        placeholder='Gwen Tennyson'
                        type='text'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled
                        placeholder='your.name@domain.com'
                        type='email'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled
                        placeholder='+919876543210'
                        type='tel'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='city'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className='capitalize'
                        disabled
                        placeholder='Moradabad'
                        type='text'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='date'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled
                        placeholder='January 01, 2025'
                        value={getDate(field.value.toString(), false, false)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='timeSlotId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled
                        placeholder='10:00 AM'
                        value={formatTime(appointment.timeSlot.time)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {appointment.appointmentHospitals.length > 0 && (
                <FormField
                  control={form.control}
                  name='appointmentHospitals'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hospitals</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={hospitals.map(h => ({
                            label: h.name,
                            value: h.id
                          }))}
                          placeholder='Select hospitals...'
                          selectedValues={field.value}
                          setSelectedValues={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {appointment.benificiary && (
                <FormField
                  control={form.control}
                  name='benificiaryId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Benificiary</FormLabel>
                      <FormControl>
                        <Textarea
                          className='capitalize'
                          {...field}
                          placeholder='Gwen Tennyson'
                          value={appointment.benificiary?.name}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name='facilities'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facilites</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={facilities.map(f => ({
                          label: f.name,
                          value: f.id
                        }))}
                        placeholder='Select facilities...'
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
                name='isReferred'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referred to another hospital</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className='w-full [&_span[data-slot]]:block [&_span[data-slot]]:truncate'>
                          <SelectValue placeholder='Select a value' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem className='capitalize' value='yes'>
                            Yes
                          </SelectItem>
                          <SelectItem className='capitalize' value='no'>
                            No
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className='w-full capitalize [&_span[data-slot]]:block [&_span[data-slot]]:truncate'>
                          <SelectValue placeholder='Select a value' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            className='capitalize'
                            value={AppointmentStatus.pending}
                          >
                            {AppointmentStatus.pending}
                          </SelectItem>
                          <SelectItem
                            className='capitalize'
                            value={AppointmentStatus.confirmed}
                          >
                            {AppointmentStatus.confirmed}
                          </SelectItem>
                          <SelectItem
                            className='capitalize'
                            value={AppointmentStatus.cancelled}
                          >
                            {AppointmentStatus.cancelled}
                          </SelectItem>
                          <SelectItem
                            className='capitalize'
                            value={AppointmentStatus.done}
                          >
                            {AppointmentStatus.done}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='notes'
                render={({ field }) => (
                  <FormItem className='lg:col-span-2'>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder='Any prior medical history or symptoms...'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='reports'
                render={({ field }) => (
                  <FormItem className='lg:col-span-2'>
                    <FormLabel>Reports</FormLabel>
                    <FormControl>
                      <TableUpload
                        accept={FILES.PDF.TYPE}
                        buttonRef={buttonRef}
                        files={appointment.reports}
                        onFilesChange={field.onChange}
                        simulateUpload={true}
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
            disabled={pending}
            form='appointment-form'
            ref={buttonRef}
            type='submit'
          >
            {pending ? 'Saving...' : 'Save'}
          </Button>
        </CardFooter>
      </Card>
      <Footer />
    </div>
  );
}
