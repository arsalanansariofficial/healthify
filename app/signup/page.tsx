import Component from '@/app/signup/component';

type Props = { searchParams: Promise<{ redirectTo?: string }> };

export default async function Page({ searchParams }: Props) {
  return <Component redirectTo={(await searchParams).redirectTo} />;
}
