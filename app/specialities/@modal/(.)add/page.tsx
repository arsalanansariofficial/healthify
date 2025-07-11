'use client';

import { toast } from 'sonner';
import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getDate } from '@/lib/utils';
import * as CND from '@/components/ui/dialog';
import { addSpeciality } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SpecialityForm } from '@/app/specialities/add/page';

export default function Page() {
  const router = useRouter();

  const [state, action, pending] = useActionState(async function (
    prevState: unknown,
    formData: FormData
  ) {
    const result = await addSpeciality(prevState, formData);

    if (result?.success) {
      toast(result.message, {
        position: 'top-center',
        description: <span className="text-foreground">{getDate()}</span>
      });
    }

    if (!result?.success && result?.message) {
      toast(<h2 className="text-destructive">{result?.message}</h2>, {
        position: 'top-center',
        description: <p className="text-destructive">{getDate()}</p>
      });
    }

    router.back();
    return result;
  }, undefined);

  return (
    <CND.Dialog open onOpenChange={router.back}>
      <CND.DialogContent>
        <CND.DialogHeader>
          <CND.DialogTitle>Add Doctor</CND.DialogTitle>
          <CND.DialogDescription>
            Add details for the doctor here. Click save when you&apos;re done.
          </CND.DialogDescription>
        </CND.DialogHeader>
        <ScrollArea>
          <SpecialityForm state={state} />
        </ScrollArea>
        <CND.DialogFooter>
          <CND.DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </CND.DialogClose>
          <Button
            type="submit"
            disabled={pending}
            formAction={action}
            form="speciality-form"
          >
            {pending ? 'Saving...' : 'Save changes'}
          </Button>
        </CND.DialogFooter>
      </CND.DialogContent>
    </CND.Dialog>
  );
}
