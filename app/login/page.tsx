import Component from '@/app/login/component';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ searchParams }: Props) {
  return <Component error={(await searchParams).error} />;
}
