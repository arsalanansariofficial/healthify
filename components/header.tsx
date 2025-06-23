'use client';

import Link from 'next/link';
import { Moon, Sun } from 'lucide-react';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="grid grid-cols-[1fr_auto] gap-4 px-8 py-4">
      <div className="grid grid-flow-col grid-cols-[auto_1fr] items-center gap-4">
        <Link
          href="/dashboard"
          className="hover:bg-accent relative hidden aspect-square rounded-md p-4 lg:block"
        >
          <span className="origin- absolute top-1/2 left-1/2 mt-0.5 ml-0.5 grid min-w-5 -translate-x-1/2 -translate-y-1/2 -rotate-45 gap-1">
            <span className="bg-primary h-1 w-full rounded-md"></span>
            <span className="bg-primary h-1 w-1/2 justify-self-center rounded-md"></span>
          </span>
        </Link>
        <Link
          href="/dashboard"
          className="hover:bg-accent grid aspect-square place-items-center rounded-md p-2 lg:hidden"
        >
          <span className="grid min-w-5 gap-1">
            <span className="bg-primary h-1 w-full rounded"></span>
            <span className="bg-primary h-1 w-full rounded"></span>
          </span>
        </Link>
        <nav className="hidden grid-flow-col gap-4 justify-self-start lg:grid">
          <Link
            href="/docs"
            className="hover:bg-accent rounded-md px-2 py-1 font-semibold"
          >
            Docs
          </Link>
          <Link
            href="/docs"
            className="hover:bg-accent rounded-md px-2 py-1 font-semibold"
          >
            Components
          </Link>
          <Link
            href="/docs"
            className="hover:bg-accent rounded-md px-2 py-1 font-semibold"
          >
            Blocks
          </Link>
          <Link
            href="/docs"
            className="hover:bg-accent rounded-md px-2 py-1 font-semibold"
          >
            Charts
          </Link>
          <Link
            href="/docs"
            className="hover:bg-accent rounded-md px-2 py-1 font-semibold"
          >
            Themes
          </Link>
          <Link
            href="/docs"
            className="hover:bg-accent rounded-md px-2 py-1 font-semibold"
          >
            Colors
          </Link>
        </nav>
      </div>
      <div className="grid grid-flow-col items-center gap-4">
        <Input
          type="text"
          name="search"
          placeholder="Search..."
          className="hidden md:block"
        />
        <FontAwesomeIcon size="lg" icon={faGithub} className="h-5 w-5" />
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-0 -rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:rotate-90" />
          <span className="sr-only">Theme Toggle</span>
        </Button>
      </div>
    </header>
  );
}
