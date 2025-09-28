import { HOST } from '@/lib/constants';

type Props = { data: { token: string } };

export function VerifyEmail({ data }: Props) {
  return `<main>
      <p>
        Click <a href="${HOST}/verify?token=${data.token}">here</a> to verify your email.
      </p>
    </>`;
}
