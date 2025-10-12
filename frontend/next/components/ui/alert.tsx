import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const alertVariants = cva(
  'flex items-stretch w-full gap-2 group-[.toaster]:w-(--width)',
  {
    compoundVariants: [
      /* Solid */
      {
        appearance: 'solid',
        className: 'bg-muted text-foreground',
        variant: 'secondary'
      },
      {
        appearance: 'solid',
        className: 'bg-primary text-primary-foreground',
        variant: 'primary'
      },
      {
        appearance: 'solid',
        className: 'bg-destructive text-destructive-foreground',
        variant: 'destructive'
      },
      {
        appearance: 'solid',
        className:
          'bg-[var(--color-success,var(--color-green-500))] text-[var(--color-success-foreground,var(--color-white))]',
        variant: 'success'
      },
      {
        appearance: 'solid',
        className:
          'bg-[var(--color-info,var(--color-violet-600))] text-[var(--color-info-foreground,var(--color-white))]',
        variant: 'info'
      },
      {
        appearance: 'solid',
        className:
          'bg-[var(--color-warning,var(--color-yellow-500))] text-[var(--color-warning-foreground,var(--color-white))]',
        variant: 'warning'
      },
      {
        appearance: 'solid',
        className:
          'bg-zinc-950 text-white dark:bg-zinc-300 dark:text-black *:data-slot-[alert=close]:text-white',
        variant: 'mono'
      },

      /* Outline */
      {
        appearance: 'outline',
        className:
          'border border-border bg-background text-foreground [&_[data-slot=alert-close]]:text-foreground',
        variant: 'secondary'
      },
      {
        appearance: 'outline',
        className:
          'border border-border bg-background text-primary [&_[data-slot=alert-close]]:text-foreground',
        variant: 'primary'
      },
      {
        appearance: 'outline',
        className:
          'border border-border bg-background text-destructive [&_[data-slot=alert-close]]:text-foreground',
        variant: 'destructive'
      },
      {
        appearance: 'outline',
        className:
          'border border-border bg-background text-[var(--color-success,var(--color-green-500))] [&_[data-slot=alert-close]]:text-foreground',
        variant: 'success'
      },
      {
        appearance: 'outline',
        className:
          'border border-border bg-background text-[var(--color-info,var(--color-violet-600))] [&_[data-slot=alert-close]]:text-foreground',
        variant: 'info'
      },
      {
        appearance: 'outline',
        className:
          'border border-border bg-background text-[var(--color-warning,var(--color-yellow-500))] [&_[data-slot=alert-close]]:text-foreground',
        variant: 'warning'
      },
      {
        appearance: 'outline',
        className:
          'border border-border bg-background text-foreground [&_[data-slot=alert-close]]:text-foreground',
        variant: 'mono'
      },

      /* Light */
      {
        appearance: 'light',
        className: 'bg-muted border border-border text-foreground',
        variant: 'secondary'
      },
      {
        appearance: 'light',
        className:
          'text-foreground bg-[var(--color-primary-soft,var(--color-blue-50))] border border-[var(--color-primary-alpha,var(--color-blue-100))] [&_[data-slot=alert-icon]]:text-primary dark:bg-[var(--color-primary-soft,var(--color-blue-950))] dark:border-[var(--color-primary-alpha,var(--color-blue-900))]',
        variant: 'primary'
      },
      {
        appearance: 'light',
        className:
          'bg-[var(--color-destructive-soft,var(--color-red-50))] border border-[var(--color-destructive-alpha,var(--color-red-100))] text-foreground [&_[data-slot=alert-icon]]:text-destructive dark:bg-[var(--color-destructive-soft,var(--color-red-950))] dark:border-[var(--color-destructive-alpha,var(--color-red-900))] ',
        variant: 'destructive'
      },
      {
        appearance: 'light',
        className:
          'bg-[var(--color-success-soft,var(--color-green-50))] border border-[var(--color-success-alpha,var(--color-green-200))] text-foreground [&_[data-slot=alert-icon]]:text-[var(--color-success-foreground,var(--color-green-600))] dark:bg-[var(--color-success-soft,var(--color-green-950))] dark:border-[var(--color-success-alpha,var(--color-green-900))]',
        variant: 'success'
      },
      {
        appearance: 'light',
        className:
          'bg-[var(--color-info-soft,var(--color-violet-50))] border border-[var(--color-info-alpha,var(--color-violet-100))] text-foreground [&_[data-slot=alert-icon]]:text-[var(--color-info-foreground,var(--color-violet-600))] dark:bg-[var(--color-info-soft,var(--color-violet-950))] dark:border-[var(--color-info-alpha,var(--color-violet-900))]',
        variant: 'info'
      },
      {
        appearance: 'light',
        className:
          'bg-[var(--color-warning-soft,var(--color-yellow-50))] border border-[var(--color-warning-alpha,var(--color-yellow-200))] text-foreground [&_[data-slot=alert-icon]]:text-[var(--color-warning-foreground,var(--color-yellow-600))] dark:bg-[var(--color-warning-soft,var(--color-yellow-950))] dark:border-[var(--color-warning-alpha,var(--color-yellow-900))]',
        variant: 'warning'
      },

      /* Mono */
      {
        className: '[&_[data-slot=alert-icon]]:text-primary',
        icon: 'primary',
        variant: 'mono'
      },
      {
        className:
          '[&_[data-slot=alert-icon]]:text-[var(--color-warning-foreground,var(--color-yellow-600))]',
        icon: 'warning',
        variant: 'mono'
      },
      {
        className:
          '[&_[data-slot=alert-icon]]:text-[var(--color-success-foreground,var(--color-green-600))]',
        icon: 'success',
        variant: 'mono'
      },
      {
        className: '[&_[data-slot=alert-icon]]:text-destructive',
        icon: 'destructive',
        variant: 'mono'
      },
      {
        className:
          '[&_[data-slot=alert-icon]]:text-[var(--color-info-foreground,var(--color-violet-600))]',
        icon: 'info',
        variant: 'mono'
      }
    ],
    defaultVariants: {
      appearance: 'solid',
      size: 'md',
      variant: 'secondary'
    },
    variants: {
      appearance: {
        light: '',
        outline: '',
        solid: '',
        stroke: 'text-foreground'
      },
      icon: {
        destructive: '',
        info: '',
        primary: '',
        success: '',
        warning: ''
      },
      size: {
        lg: 'rounded-lg p-4 gap-3 text-base [&>[data-slot=alert-icon]>svg]:size-6 *:data-slot=alert-icon:mt-0.5 [&_[data-slot=alert-close]]:mt-1',
        md: 'rounded-lg p-3.5 gap-2.5 text-sm [&>[data-slot=alert-icon]>svg]:size-5 *:data-slot=alert-icon:mt-0 [&_[data-slot=alert-close]]:mt-0.5',
        sm: 'rounded-md px-3 py-2.5 gap-2 text-xs [&>[data-slot=alert-icon]>svg]:size-4 *:data-alert-icon:mt-0.5 [&_[data-slot=alert-close]]:mt-0.25 [&_[data-slot=alert-close]_svg]:size-3.5'
      },
      variant: {
        destructive: '',
        info: '',
        mono: '',
        primary: '',
        secondary: '',
        success: '',
        warning: ''
      }
    }
  }
);

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  close?: boolean;
  onClose?: () => void;
}

interface AlertIconProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

function Alert({
  appearance,
  children,
  className,
  close = false,
  icon,
  onClose,
  size,
  variant,
  ...props
}: AlertProps) {
  return (
    <div
      className={cn(
        alertVariants({ appearance, icon, size, variant }),
        className
      )}
      data-slot='alert'
      role='alert'
      {...props}
    >
      {children}
      {close && (
        <button
          aria-label='Dismiss'
          className={cn('group size-4 shrink-0 cursor-pointer')}
          data-slot='alert-close'
          onClick={onClose}
        >
          <X className='size-4 opacity-60 group-hover:opacity-100' />
        </button>
      )}
    </div>
  );
}

function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <div
      className={cn('grow tracking-tight', className)}
      data-slot='alert-title'
      {...props}
    />
  );
}

function AlertIcon({ children, className, ...props }: AlertIconProps) {
  return (
    <div
      className={cn('shrink-0', className)}
      data-slot='alert-icon'
      {...props}
    >
      {children}
    </div>
  );
}

function AlertToolbar({ children, className, ...props }: AlertIconProps) {
  return (
    <div className={cn(className)} data-slot='alert-toolbar' {...props}>
      {children}
    </div>
  );
}

function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      className={cn('text-sm [&_p]:mb-2 [&_p]:leading-relaxed', className)}
      data-slot='alert-description'
      {...props}
    />
  );
}

function AlertContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      className={cn(
        'space-y-2 [&_[data-slot=alert-title]]:font-semibold',
        className
      )}
      data-slot='alert-content'
      {...props}
    />
  );
}

export {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  AlertToolbar
};
