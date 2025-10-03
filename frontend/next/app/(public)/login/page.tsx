import Component from '@/app/(public)/login/component';

export default async function Page({
  params
}: {
  params: Promise<{ error?: string }>;
}) {
  return <Component error={(await params).error} />;
}
