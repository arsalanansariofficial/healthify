import Component from '@/app/(public)/login/component';

type Props = { params: Promise<{ error?: string }> };

export default async function Page({ params }: Props) {
  return <Component error={(await params).error} />;
}
