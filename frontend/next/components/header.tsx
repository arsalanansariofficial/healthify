'use client';

import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Moon, Sun } from 'lucide-react';
import { User } from 'next-auth';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useState } from 'react';

import Menu from '@/components/menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { SIDEBAR, ROUTES } from '@/lib/constants';
import { cn, getImageUrl } from '@/lib/utils';

export default function Header({ user }: { user: User }) {
  const { setTheme, theme } = useTheme();
  const [hasMenu, setHasMenu] = useState(false);

  return (
    <>
      <header className='sticky top-0 z-30 px-8 py-4 backdrop-blur-xs'>
        <div className='grid grid-cols-[1fr_auto] gap-4'>
          <div className='grid grid-flow-col grid-cols-[auto_1fr] items-center gap-4'>
            <Link
              className='hover:bg-accent relative hidden aspect-square rounded-md p-4 lg:block'
              href={ROUTES.DASHBOARD}
            >
              <span className='absolute top-1/2 left-1/2 mt-0.5 ml-0.5 grid min-w-5 -translate-x-1/2 -translate-y-1/2 -rotate-45 gap-1'>
                <span className='bg-primary h-1 w-full rounded-md'></span>
                <span className='bg-primary h-1 w-1/2 justify-self-center rounded-md'></span>
              </span>
            </Link>
            <button
              className='hover:bg-accent grid aspect-square place-items-center rounded-md p-2 lg:hidden'
              onClick={() => setHasMenu(hasMenu => !hasMenu)}
            >
              <span className={cn('grid min-w-5 gap-1', { 'gap-0': hasMenu })}>
                <span
                  className={cn(
                    'bg-primary h-0.5 w-full origin-center rounded transition-all',
                    { 'relative top-px rotate-45': hasMenu }
                  )}
                />
                <span
                  className={cn(
                    'bg-primary h-0.5 w-full origin-center rounded transition-all',
                    { 'relative bottom-px -rotate-45': hasMenu }
                  )}
                />
              </span>
            </button>
            <nav className='hidden grid-flow-col gap-4 justify-self-start lg:grid'>
              <Link
                className='hover:bg-accent rounded-md px-2 py-1 font-semibold'
                href='/docs'
              >
                Docs
              </Link>
              <Link
                className='hover:bg-accent rounded-md px-2 py-1 font-semibold'
                href='/components'
              >
                Components
              </Link>
            </nav>
          </div>
          <div className='grid grid-flow-col items-center gap-4'>
            <Input
              className='placeholder:text-muted-foreground hidden placeholder:font-semibold md:block'
              name='search'
              placeholder='Search...'
              type='text'
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar>
                  <AvatarImage
                    src={getImageUrl(Boolean(user.hasOAuth), user.image)}
                  />
                  <AvatarFallback className='bg-transparent'>
                    <FontAwesomeIcon
                      className='h-5 w-5'
                      icon={faGithub}
                      size='lg'
                    />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Link href={ROUTES.ACCOUNT}>Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href={ROUTES.ABOUT}>About</Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  Signout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={() =>
                theme === 'light' ? setTheme('dark') : setTheme('light')
              }
              size='icon'
              variant='ghost'
            >
              <Sun className='h-[1.2rem] w-[1.2rem] scale-0 -rotate-90 transition-all dark:scale-100 dark:rotate-0' />
              <Moon className='absolute h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:rotate-90' />
              <span className='sr-only'>Theme Toggle</span>
            </Button>
          </div>
        </div>
      </header>
      <nav
        className={cn(
          'fixed inset-x-0 top-16 bottom-0 z-30 col-span-2 mt-1 hidden space-y-1 overflow-y-auto bg-transparent px-8 backdrop-blur-xs lg:hidden',
          { block: hasMenu }
        )}
      >
        <div className='h-full'>
          <Menu entries={Array.from(SIDEBAR.entries())} user={user} />
        </div>
      </nav>
    </>
  );
}
