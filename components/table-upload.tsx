'use client';

import {
  Trash2,
  Upload,
  Download,
  ImageIcon,
  VideoIcon,
  CloudUpload,
  FileTextIcon,
  RefreshCwIcon,
  TriangleAlert,
  HeadphonesIcon,
  FileArchiveIcon,
  FileSpreadsheetIcon
} from 'lucide-react';
import Link from 'next/link';
import { RefObject, useEffect, useMemo, useState } from 'react';

import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertContent,
  AlertDescription
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader
} from '@/components/ui/table';
import { FILES } from '@/constants/file';
import {
  formatBytes,
  useFileUpload,
  type FileMetadata,
  type FileWithPreview
} from '@/hooks/use-file-upload';
import { cn, getFilePreview, toAbsoluteUrl } from '@/lib/utils';

import { Badge } from './ui/badge';

interface FileUploadItem extends FileWithPreview {
  error?: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

interface TableUploadProps {
  accept?: string;
  maxSize?: number;
  files?: string[];
  maxFiles?: number;
  multiple?: boolean;
  className?: string;
  canUpload?: boolean;
  canDelete?: boolean;
  simulateUpload?: boolean;
  onFilesChange?: (files: File[]) => void;
  buttonRef?: RefObject<HTMLButtonElement | null>;
}

export default function TableUpload({
  accept = FILES.FILE.ACCEPT,
  buttonRef,
  canDelete = true,
  canUpload = true,
  className,
  files = [],
  maxFiles = 10,
  maxSize = FILES.FILE.MAX_SIZE,
  multiple = true,
  onFilesChange,
  simulateUpload = true
}: TableUploadProps) {
  const defaultFiles = useMemo(
    () =>
      files.map(f => ({
        ...getFilePreview(
          f,
          toAbsoluteUrl(`/api/upload/${f}`),
          FILES.PDF.MAX_SIZE,
          FILES.PDF.TYPE
        )
      })),
    [files]
  );

  const defaultUploadFiles: FileUploadItem[] = useMemo(
    () =>
      defaultFiles.map(f => ({
        ...f,
        progress: 100,
        status: 'completed' as const
      })),
    [defaultFiles]
  );

  const [uploadFiles, setUploadFiles] =
    useState<FileUploadItem[]>(defaultUploadFiles);

  const [
    { errors, isDragging },
    {
      clearFiles,
      getInputProps,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile
    }
  ] = useFileUpload({
    accept,
    initialFiles: defaultFiles.map(f => f.file),
    maxFiles,
    maxSize,
    multiple,
    onFilesChange(newFiles) {
      const newUploadFiles = newFiles.map(file => {
        const existingFile = uploadFiles.find(
          existing => existing.id === file.id
        );

        return existingFile
          ? { ...existingFile, ...file }
          : { ...file, progress: 0, status: 'uploading' as const };
      });
      setUploadFiles(newUploadFiles);
      onFilesChange?.(newUploadFiles.map(f => f.file as File));
      if (buttonRef?.current) buttonRef.current.disabled = true;
    }
  });

  useEffect(() => {
    if (!simulateUpload) return;

    const interval = setInterval(() => {
      setUploadFiles(prev => {
        const newFiles = prev.map(file => {
          if (file.status !== 'uploading') return file;

          const increment = Math.random() * 15 + 5;
          const newProgress = Math.min(file.progress + increment, 100);

          if (newProgress >= 100)
            return { ...file, progress: 100, status: 'completed' as const };

          return { ...file, progress: newProgress };
        });

        if (newFiles.every(f => f.progress >= 100))
          if (buttonRef?.current) buttonRef.current.disabled = false;

        return newFiles;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [buttonRef, simulateUpload]);

  function removeUploadFile(fileId: string) {
    setUploadFiles(prev => prev.filter(file => file.id !== fileId));
    removeFile(fileId);
    if (buttonRef?.current) buttonRef.current.disabled = false;
  }

  function retryUpload(fileId: string) {
    if (buttonRef?.current) buttonRef.current.disabled = true;
    setUploadFiles(prev =>
      prev.map(file =>
        file.id === fileId
          ? {
              ...file,
              error: undefined,
              progress: 0,
              status: 'uploading' as const
            }
          : file
      )
    );
  }

  function getFileIcon(file: File | FileMetadata) {
    const type = file instanceof File ? file.type : file.type;
    if (type.startsWith('image/')) return <ImageIcon className='size-4' />;
    if (type.startsWith('video/')) return <VideoIcon className='size-4' />;
    if (type.startsWith('audio/')) return <HeadphonesIcon className='size-4' />;
    if (type.includes('pdf')) return <FileTextIcon className='size-4' />;
    if (type.includes('word') || type.includes('doc'))
      return <FileTextIcon className='size-4' />;
    if (type.includes('excel') || type.includes('sheet'))
      return <FileSpreadsheetIcon className='size-4' />;
    if (type.includes('zip') || type.includes('rar'))
      return <FileArchiveIcon className='size-4' />;
    return <FileTextIcon className='size-4' />;
  }

  function getFileTypeLabel(file: File | FileMetadata) {
    const type = file instanceof File ? file.type : file.type;
    if (type.startsWith('image/')) return 'Image';
    if (type.startsWith('video/')) return 'Video';
    if (type.startsWith('audio/')) return 'Audio';
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('word') || type.includes('doc')) return 'Word';
    if (type.includes('excel') || type.includes('sheet')) return 'Excel';
    if (type.includes('zip') || type.includes('rar')) return 'Archive';
    if (type.includes('json')) return 'JSON';
    if (type.includes('text')) return 'Text';
    return 'File';
  }

  return (
    <div className={cn('w-full space-y-4', className)}>
      {canUpload && (
        <div
          className={cn(
            'relative rounded-lg border border-dashed p-6 text-center transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}>
          <input {...getInputProps()} className='sr-only' />
          <div className='flex flex-col items-center gap-4'>
            <div
              className={cn(
                'bg-muted flex h-12 w-12 cursor-pointer items-center justify-center rounded-full transition-colors',
                isDragging
                  ? 'border-primary bg-primary/10'
                  : 'border-muted-foreground/25'
              )}
              onClick={openFileDialog}>
              <Upload className='text-muted-foreground h-5 w-5 cursor-pointer' />
            </div>
            <p className='text-muted-foreground text-xs'>
              Maximum file size: {formatBytes(maxSize)}, Maximum files:
              {maxFiles}
            </p>
          </div>
        </div>
      )}
      {uploadFiles.length > 0 && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            {canUpload && canDelete && (
              <h3 className='text-sm font-medium'>
                Files ({uploadFiles.length})
              </h3>
            )}
            <div className='flex gap-2'>
              {canUpload && (
                <Button
                  onClick={openFileDialog}
                  size='sm'
                  type='button'
                  variant='outline'>
                  <CloudUpload />
                  Add files
                </Button>
              )}
              {canDelete && (
                <Button
                  onClick={() => {
                    clearFiles();
                    if (buttonRef?.current) buttonRef.current.disabled = false;
                  }}
                  size='sm'
                  type='button'
                  variant='outline'>
                  <Trash2 />
                  Remove all
                </Button>
              )}
            </div>
          </div>
          <div className='rounded-lg border'>
            <Table>
              <TableHeader>
                <TableRow className='text-xs'>
                  <TableHead className='h-9'>Name</TableHead>
                  <TableHead className='h-9'>Type</TableHead>
                  <TableHead className='h-9'>Size</TableHead>
                  <TableHead className='h-9 w-[100px] text-end'>
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadFiles.map(fileItem => (
                  <TableRow key={fileItem.id}>
                    <TableCell className='py-2 ps-1.5'>
                      <div className='flex items-center gap-1'>
                        <div
                          className={cn(
                            'text-muted-foreground/80 relative flex size-8 shrink-0 items-center justify-center'
                          )}>
                          {fileItem.status === 'uploading' ? (
                            <div className='relative'>
                              <svg
                                className='size-8 -rotate-90'
                                viewBox='0 0 32 32'>
                                <circle
                                  className='text-muted-foreground/20'
                                  cx='16'
                                  cy='16'
                                  fill='none'
                                  r='14'
                                  stroke='currentColor'
                                  strokeWidth='2'
                                />
                                <circle
                                  className='text-primary transition-all duration-300'
                                  cx='16'
                                  cy='16'
                                  fill='none'
                                  r='14'
                                  stroke='currentColor'
                                  strokeDasharray={`${2 * Math.PI * 14}`}
                                  strokeDashoffset={`${2 * Math.PI * 14 * (1 - fileItem.progress / 100)}`}
                                  strokeLinecap='round'
                                  strokeWidth='2'
                                />
                              </svg>
                              <div className='absolute inset-0 flex items-center justify-center'>
                                {getFileIcon(fileItem.file)}
                              </div>
                            </div>
                          ) : (
                            <div className='not-[]:size-8 flex items-center justify-center'>
                              {getFileIcon(fileItem.file)}
                            </div>
                          )}
                        </div>
                        <p className='flex items-center gap-1 text-sm font-medium'>
                          <span className='max-w-12 truncate sm:max-w-none'>
                            {fileItem.file.name}
                          </span>
                          <span>
                            {fileItem.status === 'error' && (
                              <Badge variant='destructive'>Error</Badge>
                            )}
                          </span>
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className='py-2'>
                      <Badge className='text-xs' variant='secondary'>
                        {getFileTypeLabel(fileItem.file)}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-muted-foreground py-2 text-sm'>
                      {formatBytes(fileItem.file.size)}
                    </TableCell>
                    <TableCell className='py-2 pe-1'>
                      <div
                        className={cn('flex items-center gap-1 px-2', {
                          'justify-end': !canDelete
                        })}>
                        {fileItem.preview && (
                          <Button
                            asChild
                            className='size-8'
                            size='icon'
                            type='button'
                            variant='secondary'>
                            <Link href={fileItem.preview} target='_blank'>
                              <Download className='size-3.5' />
                            </Link>
                          </Button>
                        )}
                        {fileItem.status === 'error' ? (
                          <Button
                            className='text-destructive/80 hover:text-destructive size-8'
                            onClick={() => retryUpload(fileItem.id)}
                            size='icon'
                            type='button'
                            variant='secondary'>
                            <RefreshCwIcon className='size-3.5' />
                          </Button>
                        ) : (
                          canDelete && (
                            <Button
                              className='size-8'
                              onClick={() => removeUploadFile(fileItem.id)}
                              size='icon'
                              type='button'
                              variant='secondary'>
                              <Trash2 className='size-3.5' />
                            </Button>
                          )
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      {errors.length > 0 && (
        <Alert appearance='light' className='mt-5' variant='destructive'>
          <AlertIcon>
            <TriangleAlert />
          </AlertIcon>
          <AlertContent>
            <AlertTitle>File upload error(s)</AlertTitle>
            <AlertDescription>
              {errors.map((error, index) => (
                <p className='last:mb-0' key={index}>
                  {error}
                </p>
              ))}
            </AlertDescription>
          </AlertContent>
        </Alert>
      )}
    </div>
  );
}
