import { useState } from 'react';

export default function useHookForm<T>(action: (data: T) => Promise<void>) {
  const [pending, setPending] = useState(false);

  async function handleSubmit(data: T) {
    setPending(true);
    await action(data);
    setPending(false);
  }

  return { pending, handleSubmit };
}
