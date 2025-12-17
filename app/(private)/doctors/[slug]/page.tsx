import Image from 'next/image';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getDate } from '@/lib/utils';
import { DOMAIN } from '@/lib/constants';
import Footer from '@/components/footer';

type Props = { params: Promise<{ slug: string }> };

export default async function Page({ params }: Props) {
  const [session, doctor] = await Promise.all([
    auth(),
    prisma.user.findUnique({
      where: { id: (await params).slug }
    })
  ]);

  if (!session?.user || !doctor) notFound();

  const response = await fetch(`${DOMAIN.LOCAL}/api/upload/${doctor.bio}`);
  if (!response.ok) notFound();

  return (
    <section className="grid h-full grid-rows-[auto_auto_1fr] space-y-8 lg:mx-auto lg:w-10/12">
      <header className="relative h-80 space-y-2">
        <Image
          fill
          priority
          unoptimized
          alt="Post Image"
          className="aspect-video rounded-lg object-cover"
          src={`${!doctor.hasOAuth ? `${DOMAIN.LOCAL}/api/upload/` : ''}${doctor.image}`}
        />
      </header>
      <main className="space-y-4">
        <h1 className="decoration-border/75 font-serif text-3xl font-bold underline decoration-2 underline-offset-8">
          {doctor.name}
        </h1>
        <p className="text-muted-foreground text-xs">
          {doctor.name} / {getDate(doctor.createdAt.toString())}
        </p>
      </main>
      <footer className="prose dark:prose-invert max-w-none">
        <MDXRemote source={await response.text()} />
      </footer>
      <Footer />
    </section>
  );
}
