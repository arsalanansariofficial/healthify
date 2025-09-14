import Component from '@/app/login/component';

type Props = { searchParams: Promise<{ error?: string; redirectTo?: string }> };

export default async function Page({ searchParams }: Props) {
  const { error, redirectTo } = await searchParams;
  return (
    <Component
      error={error}
      redirectTo={decodeURIComponent(redirectTo || String())}
    />
  );
}
