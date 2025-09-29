import { DOMAIN } from '@/lib/constants';

type Props = { data: { token: string } };

export function VerifyEmail({ data }: Props) {
  return `<main>
      <p>
        Click <a href="${DOMAIN.LOCAL}/verify?token=${data.token}">here</a> to verify your email.
      </p>
    </>`;
}
