'use client';

import { toast } from 'sonner';
import { useActionState } from 'react';

import { getDate } from '@/lib/utils';
import * as CN from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { addSpeciality, FormState } from '@/lib/actions';

export function SpecialityForm({ state }: { state: FormState | undefined }) {
  return (
    <form id="speciality-form" className="grid gap-4 py-2">
      <div className="grid gap-3">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          className="capitalize"
          placeholder="Physician"
          defaultValue={state?.name}
        />
        {state?.errors?.name && (
          <p className="text-destructive text-xs">{state.errors.name}</p>
        )}
      </div>
    </form>
  );
}

export default function Page() {
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

    return result;
  }, undefined);

  return (
    <section className="col-span-2 h-full space-y-4 lg:col-span-1">
      <header>
        <CN.Card>
          <CN.CardContent>
            <h1 className="font-semibold">Speciality</h1>
          </CN.CardContent>
        </CN.Card>
      </header>
      <main className="mx-auto">
        <CN.Card>
          <CN.CardHeader>
            <CN.CardTitle>Add Speciality</CN.CardTitle>
            <CN.CardDescription>
              Add new speciality here. Click save when you&apos;re done.
            </CN.CardDescription>
          </CN.CardHeader>
          <CN.CardContent>
            <SpecialityForm state={state} />
          </CN.CardContent>
          <CN.CardFooter>
            <Button
              type="submit"
              disabled={pending}
              formAction={action}
              form="speciality-form"
            >
              {pending ? 'Saving...' : 'Save'}
            </Button>
          </CN.CardFooter>
        </CN.Card>
      </main>
    </section>
  );
}
