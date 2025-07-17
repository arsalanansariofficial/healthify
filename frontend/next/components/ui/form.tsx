'use client';

import { Slot } from '@radix-ui/react-slot';
import * as LabelPrimitive from '@radix-ui/react-label';
import { ComponentProps, createContext, useContext, useId } from 'react';

import {
  Controller,
  FormProvider,
  useFormState,
  useFormContext,
  type FieldPath,
  type FieldValues,
  type ControllerProps
} from 'react-hook-form';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

type FormItemContextValue = { id: string };

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = { name: TName };

export const Form = FormProvider;
export const FormFieldContext = createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

const FormItemContext = createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

export function FormDescription({ className, ...props }: ComponentProps<'p'>) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      {...props}
      id={formDescriptionId}
      data-slot="form-description"
      className={cn('text-muted-foreground text-sm', className)}
    />
  );
}

export function FormItem({ className, ...props }: ComponentProps<'div'>) {
  const id = useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        {...props}
        data-slot="form-item"
        className={cn('grid gap-2', className)}
      />
    </FormItemContext.Provider>
  );
}

export function FormLabel(props: ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      {...props}
      data-error={!!error}
      htmlFor={formItemId}
      data-slot="form-label"
      className={cn('data-[error=true]:text-destructive', props.className)}
    />
  );
}

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

export function FormMessage({ className, ...props }: ComponentProps<'p'>) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? '') : props.children;

  if (!body) return null;

  return (
    <p
      {...props}
      id={formMessageId}
      data-slot="form-message"
      className={cn('text-destructive text-sm', className)}
    >
      {body}
    </p>
  );
}

export function FormControl({ ...props }: ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      {...props}
      id={formItemId}
      aria-invalid={!!error}
      data-slot="form-control"
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
    />
  );
}

export function useFormField() {
  const { getFieldState } = useFormContext();
  const itemContext = useContext(FormItemContext);
  const fieldContext = useContext(FormFieldContext);
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    ...fieldState,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formMessageId: `${id}-form-item-message`,
    formDescriptionId: `${id}-form-item-description`
  };
}
