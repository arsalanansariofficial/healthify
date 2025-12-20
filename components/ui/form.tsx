'use client';

import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
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

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

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
      className={cn('text-muted-foreground text-sm', className)}
      data-slot='form-description'
      id={formDescriptionId}
    />
  );
}

export function FormItem({ className, ...props }: ComponentProps<'div'>) {
  const id = useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        {...props}
        className={cn('grid gap-2', className)}
        data-slot='form-item'
      />
    </FormItemContext.Provider>
  );
}

export function FormLabel(props: ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      {...props}
      className={cn('data-[error=true]:text-destructive', props.className)}
      data-error={!!error}
      data-slot='form-label'
      htmlFor={formItemId}
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
      className={cn('text-destructive text-sm', className)}
      data-slot='form-message'
      id={formMessageId}
    >
      {body}
    </p>
  );
}

export function FormControl({ ...props }: ComponentProps<typeof Slot>) {
  const { error, formDescriptionId, formItemId, formMessageId } =
    useFormField();

  return (
    <Slot
      {...props}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      data-slot='form-control'
      id={formItemId}
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
    formDescriptionId: `${id}-form-item-description`,
    formItemId: `${id}-form-item`,
    formMessageId: `${id}-form-item-message`,
    name: fieldContext.name
  };
}
