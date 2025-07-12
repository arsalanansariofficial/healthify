'use client';

import { useRouter } from 'next/navigation';

import { DoctorProps } from '@/lib/types';
import * as CND from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DoctorForm, useDoctorForm } from '@/app/doctors/add/component';

export default function Component({ specialities }: DoctorProps) {
  const router = useRouter();
  const props = useDoctorForm();

  return (
    <CND.Dialog open onOpenChange={router.back}>
      <CND.DialogContent>
        <CND.DialogHeader className="px-2">
          <CND.DialogTitle>Add Doctor</CND.DialogTitle>
          <CND.DialogDescription>
            Add details for the doctor here. Click save when you&apos;re done.
          </CND.DialogDescription>
        </CND.DialogHeader>
        <ScrollArea className="h-[50vh] pr-4">
          <DoctorForm
            className="px-2"
            image={props.image}
            state={props.state}
            gender={props.gender}
            timings={props.timings}
            imageSrc={props.imageSrc}
            setImage={props.setImage}
            specialities={specialities}
            setGender={props.setGender}
            setTimings={props.setTimings}
            setImageSrc={props.setImageSrc}
            selectedDays={props.selectedDays}
            setSelectedDays={props.setSelectedDays}
            selectedSpecialities={props.selectedSpecialities}
            setSelectedSpecialities={props.setSelectedSpecialities}
          />
        </ScrollArea>
        <CND.DialogFooter>
          <Button
            type="submit"
            form="doctor-form"
            disabled={props.pending}
            formAction={props.action}
          >
            {props.pending ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="outline">Cancel</Button>
        </CND.DialogFooter>
      </CND.DialogContent>
    </CND.Dialog>
  );
}
