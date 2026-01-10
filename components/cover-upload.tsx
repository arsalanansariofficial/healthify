'use client';

import { CloudUpload, ImageIcon, Upload, XIcon } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  useFileUpload,
  type FileMetadata,
  type FileWithPreview
} from '@/hooks/use-file-upload';
import { cn } from '@/lib/utils';

interface CoverUploadProps {
  accept?: string;
  maxSize?: number;
  imageUrl?: string;
  className?: string;
  onImageChange?: (file: File | null) => void;
}

export default function CoverUpload({
  accept = 'image/*',
  className,
  imageUrl,
  maxSize = 5 * 1024 * 1024,
  onImageChange
}: CoverUploadProps) {
  const defaultCoverImage: FileMetadata = {
    id: 'default-cover',
    name: 'cover-image.jpg',
    size: 2048000,
    type: 'image/jpeg',
    url: imageUrl || String()
  };

  const [imageLoading, setImageLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [coverImage, setCoverImage] = useState<FileWithPreview | null>({
    file: defaultCoverImage,
    id: defaultCoverImage.id,
    preview: defaultCoverImage.url
  });
  const hasImage = coverImage && coverImage.preview;

  const [
    { isDragging },
    {
      getInputProps,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog
    }
  ] = useFileUpload({
    accept,
    maxFiles: 1,
    maxSize,
    multiple: false,
    onFilesChange: files => {
      if (files.length > 0) {
        setImageLoading(true);
        setIsUploading(true);
        setUploadProgress(0);
        setCoverImage(files[0]);
        simulateUpload();
      }
    }
  });

  useEffect(() => {
    if (coverImage?.file) {
      onImageChange?.(coverImage.file as File);
    }
  }, [coverImage, onImageChange]);

  const simulateUpload = () => {
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }

        const increment = Math.random() * 10 + 5;
        return Math.min(prev + increment, 100);
      });
    }, 200);
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setImageLoading(false);
    setIsUploading(false);
    setUploadProgress(0);
    onImageChange?.(null);
  };

  return (
    <div
      className={cn(
        'group border-border relative cursor-pointer overflow-hidden rounded-xl border transition-all duration-200',
        isDragging
          ? 'border-primary bg-primary/5 border-dashed'
          : hasImage
            ? 'border-border bg-background hover:border-primary/50'
            : 'border-muted-foreground/25 bg-muted/30 hover:border-primary hover:bg-primary/5 border-dashed',
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input {...getInputProps()} className='sr-only' />
      {hasImage && (
        <div className='relative h-full w-full'>
          {imageLoading && (
            <div className='bg-muted absolute inset-0 flex animate-pulse items-center justify-center'>
              <div className='text-muted-foreground flex flex-col items-center gap-2'>
                <ImageIcon className='size-5' />
                <span className='text-sm'>Loading image...</span>
              </div>
            </div>
          )}
          <div className='relative h-full w-full'>
            <Image
              alt='Cover'
              className={cn(
                'h-full w-full object-cover transition-opacity duration-300',
                imageLoading ? 'opacity-0' : 'opacity-100'
              )}
              fill
              onError={() => setImageLoading(false)}
              onLoad={() => setImageLoading(false)}
              src={coverImage.preview as string}
              unoptimized
            />
          </div>
          <div className='absolute inset-0 bg-black/0 transition-all duration-200 group-hover:bg-black/40' />
          <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
            <div className='flex gap-2'>
              <Button
                className='bg-white/90 text-gray-900 hover:bg-white'
                onClick={openFileDialog}
                size='sm'
                variant='secondary'
              >
                <Upload />
                Change Cover
              </Button>
              <Button
                onClick={removeCoverImage}
                size='sm'
                variant='destructive'
              >
                <XIcon />
                Remove
              </Button>
            </div>
          </div>
          {isUploading && (
            <div className='absolute inset-0 flex items-center justify-center bg-black/40'>
              <div className='relative'>
                <svg className='size-16 -rotate-90' viewBox='0 0 64 64'>
                  <circle
                    className='text-white/20'
                    cx='32'
                    cy='32'
                    fill='none'
                    r='28'
                    stroke='currentColor'
                    strokeWidth='4'
                  />
                  <circle
                    className='text-white transition-all duration-300'
                    cx='32'
                    cy='32'
                    fill='none'
                    r='28'
                    stroke='currentColor'
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - uploadProgress / 100)}`}
                    strokeLinecap='round'
                    strokeWidth='4'
                  />
                </svg>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <span className='text-sm font-medium text-white'>
                    {Math.round(uploadProgress)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {!hasImage && (
        <div
          className='grid h-full place-items-center'
          onClick={openFileDialog}
        >
          <div className='bg-primary/10 rounded-full p-4'>
            <CloudUpload className='text-primary size-6' />
          </div>
        </div>
      )}
    </div>
  );
}
