import { toast } from 'sonner';

import { getDate } from '@/lib/utils';
import { FormState } from '@/lib/actions';

export default async function handler<T, R extends FormState | undefined>(
  data: T,
  action: (data: T) => Promise<R>,
  error?: string
) {
  const result = await action(data);

  if (result?.success) {
    toast(result.message, {
      position: 'top-center',
      description: <span className="text-foreground">{getDate()}</span>
    });
  }

  if (error) {
    toast(<h2 className="text-destructive">{error}</h2>, {
      position: 'top-center',
      description: <p className="text-destructive">{getDate()}</p>
    });
  }

  if (!result?.success && result?.message) {
    toast(<h2 className="text-destructive">{result?.message}</h2>, {
      position: 'top-center',
      description: <p className="text-destructive">{getDate()}</p>
    });
  }
}
