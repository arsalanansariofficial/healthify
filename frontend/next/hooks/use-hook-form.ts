import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

type Action<T, R> = (data: T) => Promise<R>;

type Handler<T, R> = (
  data: T,
  action: Action<T, R>,
  error?: string
) => Promise<void>;

export default function useHookForm<T, R>(
  handler: Handler<T, R>,
  action: Action<T, R>,
  updateClient = false,
  error?: string
) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleSubmit = useCallback(
    async (data: T) => {
      setPending(true);
      await handler(data, action, error);
      if (updateClient) router.refresh();
      setPending(false);
    },
    [action, error, handler, router, updateClient]
  );

  return { pending, handleSubmit };
}
