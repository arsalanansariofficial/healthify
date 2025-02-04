import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

  async function handleSubmit(data: T) {
    setPending(true);
    await handler(data, action, error);
    if (updateClient) router.refresh();
    setPending(false);
  }

  return { pending, handleSubmit };
}
