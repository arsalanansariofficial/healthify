'use client';

import { useRouter } from 'next/navigation';

import * as CND from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DoctorForm } from '@/app/doctors/add/page';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Page() {
  const router = useRouter();

  return (
    <CND.Dialog open onOpenChange={router.back}>
      <CND.DialogContent>
        <CND.DialogHeader>
          <CND.DialogTitle>Add Doctor</CND.DialogTitle>
          <CND.DialogDescription>
            Add details for the doctor here. Click save when you&apos;re done.
          </CND.DialogDescription>
        </CND.DialogHeader>
        <ScrollArea className="h-[50vh] pr-4">
          <DoctorForm />
        </ScrollArea>
        <CND.DialogFooter>
          <CND.DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </CND.DialogClose>
          <Button type="submit">Save changes</Button>
        </CND.DialogFooter>
      </CND.DialogContent>
    </CND.Dialog>
  );
}
