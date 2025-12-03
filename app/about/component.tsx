'use client';

import { toast } from 'sonner';
import remarkGfm from 'remark-gfm';
import { useCallback } from 'react';
import { User } from '@prisma/client';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { zodResolver } from '@hookform/resolvers/zod';

import { getDate } from '@/lib/utils';
import { updateBio } from '@/lib/actions';
import { bioSchema } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';
import handler from '@/components/display-toast';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormItem, FormField, FormControl } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  Card,
  CardTitle,
  CardHeader,
  CardAction,
  CardDescription
} from '@/components/ui/card';

type NewType = { user: Pick<User, 'id' | 'bio' | 'name'> };

export default function Component({ user }: NewType) {
  const { handleSubmit } = useHookForm(
    handler,
    updateBio.bind(null, user.id as string) as (
      data: unknown
    ) => Promise<unknown>,
    true
  );

  const userForm = useForm({
    resolver: zodResolver(bioSchema),
    defaultValues: { bio: user.bio || String() }
  });

  const onError = useCallback(
    (errors: typeof userForm.formState.errors): void => {
      if (errors.bio?.message) {
        toast(<h2 className="text-destructive">{errors.bio.message}</h2>, {
          position: 'top-center',
          description: <p className="text-destructive">{getDate()}</p>
        });
      }
    },
    [userForm]
  );

  return (
    <Tabs defaultValue="write" className="h-full">
      <Card>
        <CardHeader>
          <CardTitle>{user.name}</CardTitle>
          <CardDescription>
            Add a description about yourself in markdown, click save when
            you&apos;re done.
          </CardDescription>
          <TabsList>
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <CardAction>
            <Button
              type="submit"
              form="bio-form"
              className="cursor-pointer"
              disabled={userForm.formState.isSubmitting}
            >
              {userForm.formState.isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </CardAction>
        </CardHeader>
      </Card>
      <Form {...userForm}>
        <form
          id="bio-form"
          className="h-full space-y-2"
          onSubmit={userForm.handleSubmit(handleSubmit, onError)}
        >
          <TabsContent value="write" className="h-full">
            <FormField
              name="bio"
              control={userForm.control}
              render={({ field }) => (
                <FormItem className="h-full">
                  <FormControl className="h-full">
                    <Textarea
                      {...field}
                      placeholder="Add something about you..."
                      className="h-full rounded-xl p-8 font-mono text-sm"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </TabsContent>
          <TabsContent
            value="preview"
            className="prose prose-neutral dark:prose-invert h-full max-w-none rounded-xl border p-8 shadow"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {userForm.watch().bio}
            </ReactMarkdown>
          </TabsContent>
        </form>
      </Form>
    </Tabs>
  );
}
