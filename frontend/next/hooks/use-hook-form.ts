import { useState } from 'react';

type Action<T, R> = (data: T) => Promise<R | undefined>;

type Handler<T, R> = (
  data: T,
  action: Action<T, R>,
  error?: string
) => Promise<void>;

export default function useHookForm<T, R>(
  handler: Handler<T, R>,
  action: Action<T, R>,
  error?: string
) {
  const [pending, setPending] = useState(false);

  async function handleSubmit(data: T) {
    setPending(true);
    await handler(data, action, error);
    setPending(false);
  }

  return { pending, handleSubmit };
}
