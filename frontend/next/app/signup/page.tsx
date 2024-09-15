'use client';

import Link from 'next/link';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function Page() {
  return (
    <main className="row-start-2 grid place-items-center">
      <section className="p-4">
        <form className="min-w-sm space-y-4 rounded-md border border-dashed p-4">
          <div className="space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Gwen Tennyson"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your.name@domain.com"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password@123"
            />
          </div>
          <Button type="submit" className="w-full cursor-pointer">
            Signup
          </Button>
        </form>
        <Button variant="link" className="mx-auto block p-0 text-center">
          <Link href="/login">Already have an account? Login</Link>
        </Button>
      </section>
    </main>
  );
}
