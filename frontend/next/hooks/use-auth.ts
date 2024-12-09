import { useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function useAuth() {
  const session = useSession();
  const sessionRef = useRef(session);

  useEffect(() => {
    sessionRef.current?.update();
  }, []);

  return session.data?.user;
}
