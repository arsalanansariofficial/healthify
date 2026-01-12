'use client';

import { User, X } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { useFileUpload } from '@/hooks/use-file-upload';
import { cn, ext } from '@/lib/utils';

export default function AvatarUpload({
  className,
  defaultAvatar,
  maxSize = 2 * 1024 * 1024,
  onFileChange
}: {
  maxSize?: number;
  className?: string;
  defaultAvatar?: string;
  onFileChange?: (file: File) => void;
}) {
  const [
    { files, isDragging },
    {
      getInputProps,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      handleFileChange,
      openFileDialog,
      removeFile
    }
  ] = useFileUpload({
    accept: 'image/*',
    maxFiles: 1,
    maxSize,
    multiple: false
  });

  const currentFile = files[0];
  const previewUrl = currentFile?.preview || defaultAvatar;

  const handleRemove = () => {
    if (currentFile) removeFile(currentFile.id);
  };

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'group/avatar bg-primary-foreground/70 relative h-24 w-24 cursor-pointer overflow-hidden rounded-full border border-dashed transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/20',
          previewUrl && 'border-solid'
        )}
        onClick={openFileDialog}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          {...getInputProps()}
          className='sr-only'
          onChange={e => {
            if (onFileChange && e.target.files && e.target.files.length) {
              const file = e.target.files[0];
              onFileChange(new File([file], ext(file), file));
              handleFileChange(e);
            }
          }}
        />
        {previewUrl ? (
          <div className='relative h-full w-full'>
            <Image
              alt='Avatar'
              className='h-full w-full object-cover'
              fill
              src={previewUrl}
              unoptimized
            />
          </div>
        ) : (
          <div className='flex h-full w-full items-center justify-center'>
            <User className='text-muted-foreground size-6' />
          </div>
        )}
      </div>
      {currentFile && (
        <Button
          aria-label='Remove avatar'
          className='absolute end-0 top-0 size-6 rounded-full'
          onClick={handleRemove}
          size='icon'
          type='button'
          variant='outline'
        >
          <X className='size-3.5' />
        </Button>
      )}
    </div>
  );
}
