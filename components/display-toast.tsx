import { toast } from 'sonner';

import { getDate } from '@/lib/utils';

export default async function handler<T, R>(
  data: T,
  action: (data: T) => Promise<R>,
  error?: string
) {
  const result = (await action(data)) as { message: string; success: boolean };

  if (error) {
    toast(<h2 className="text-destructive">{error}</h2>, {
      position: 'top-center',
      description: <p className="text-destructive">{getDate()}</p>
    });
  }

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
}
