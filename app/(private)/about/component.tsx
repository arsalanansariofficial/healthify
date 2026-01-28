'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '@prisma/client';
import { useForm, useWatch } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';

import handler from '@/components/display-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardTitle,
  CardHeader,
  CardAction,
  CardDescription
} from '@/components/ui/card';
import { Form, FormItem, FormField, FormControl } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import useHookForm from '@/hooks/use-hook-form';
import { updateBio } from '@/lib/actions';
import { bioSchema } from '@/lib/schemas';
import { getDate } from '@/lib/utils';

export default function Component({
  user
}: {
  user: Pick<User, 'id' | 'bio' | 'name'>;
}) {
  const { handleSubmit } = useHookForm(
    handler,
    updateBio.bind(null, user.id as string) as (
      data: unknown
    ) => Promise<unknown>,
    true
  );

  const userForm = useForm({
    defaultValues: { bio: user.bio || String() },
    resolver: zodResolver(bioSchema)
  });

  function onError(errors: typeof userForm.formState.errors): void {
    if (errors.bio?.message)
      toast(<h2 className='text-destructive'>{errors.bio.message}</h2>, {
        description: <p className='text-destructive'>{getDate()}</p>,
        position: 'top-center'
      });
  }
  const { bio } = useWatch({ control: userForm.control });

  return (
    <Tabs className='h-full' defaultValue='write'>
      <Card>
        <CardHeader>
          <CardTitle>{user.name}</CardTitle>
          <CardDescription>
            Add a description about yourself in markdown, click save when
            you&apos;re done.
          </CardDescription>
          <TabsList>
            <TabsTrigger value='write'>Write</TabsTrigger>
            <TabsTrigger value='preview'>Preview</TabsTrigger>
          </TabsList>
          <CardAction>
            <Button
              className='cursor-pointer'
              disabled={userForm.formState.isSubmitting}
              form='bio-form'
              type='submit'
            >
              {userForm.formState.isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </CardAction>
        </CardHeader>
      </Card>
      <Form {...userForm}>
        <form
          className='h-full space-y-2'
          id='bio-form'
          onSubmit={userForm.handleSubmit(handleSubmit, onError)}
        >
          <TabsContent className='h-full' value='write'>
            <FormField
              control={userForm.control}
              name='bio'
              render={({ field }) => (
                <FormItem className='h-full'>
                  <FormControl className='h-full'>
                    <Textarea
                      {...field}
                      className='h-full rounded-xl p-8 font-mono text-sm'
                      placeholder='Add something about you...'
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </TabsContent>
          <TabsContent
            className='prose prose-neutral dark:prose-invert h-full max-w-none rounded-xl border p-8 shadow'
            value='preview'
          >
            <ReactMarkdown
              rehypePlugins={[rehypeHighlight]}
              remarkPlugins={[remarkGfm]}
            >
              {bio}
            </ReactMarkdown>
          </TabsContent>
        </form>
      </Form>
    </Tabs>
  );
}
