'use client';

import type React from 'react';

import {
  useRef,
  useState,
  useCallback,
  type DragEvent,
  type ChangeEvent,
  type InputHTMLAttributes
} from 'react';

import { FILES } from '@/constants/file';
import { ext, getFileErrorMessage } from '@/lib/utils';

export type FileUploadState = {
  errors: string[];
  isDragging: boolean;
  files: FileWithPreview[];
};

export type FileWithPreview = {
  id: string;
  preview?: string;
  file: File | FileMetadata;
};

export type FileMetadata = {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
};

export type FileUploadOptions = {
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  initialFiles?: FileMetadata[];
  onError?: (errors: string[]) => void;
  onFilesChange?: (files: FileWithPreview[]) => void;
  onFilesAdded?: (addedFiles: FileWithPreview[]) => void;
};

export type FileUploadActions = {
  addFiles: (files: FileList | File[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  clearErrors: () => void;
  handleDragEnter: (e: DragEvent<HTMLElement>) => void;
  handleDragLeave: (e: DragEvent<HTMLElement>) => void;
  handleDragOver: (e: DragEvent<HTMLElement>) => void;
  handleDrop: (e: DragEvent<HTMLElement>) => void;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  openFileDialog: () => void;
  getInputProps: (
    props?: InputHTMLAttributes<HTMLInputElement>
  ) => InputHTMLAttributes<HTMLInputElement> & {
    ref: React.Ref<HTMLInputElement>;
  };
};

const KILO_BYTE = 1024;
const SIZES = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = KILO_BYTE;
  const sizes = SIZES;
  const dm = decimals < 0 ? 0 : decimals;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Number.parseFloat((bytes / k ** i).toFixed(dm)) + sizes[i];
};

export const useFileUpload = (
  options: FileUploadOptions = {}
): [FileUploadState, FileUploadActions] => {
  const {
    accept = FILES.FILE.ACCEPT,
    initialFiles = [],
    maxFiles = Number.POSITIVE_INFINITY,
    maxSize = Number.POSITIVE_INFINITY,
    multiple = false,
    onError,
    onFilesAdded,
    onFilesChange
  } = options;

  const [state, setState] = useState<FileUploadState>({
    errors: [],
    files: initialFiles.map(file => ({
      file,
      id: file.id,
      preview: file.url
    })),
    isDragging: false
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File | FileMetadata): string | null => {
      if (file instanceof File && file.size > maxSize) {
        return getFileErrorMessage({
          file,
          maxSize: formatBytes(maxSize),
          name: 'size'
        });
      }

      if (accept !== FILES.FILE.ACCEPT) {
        const acceptedTypes = accept.split(',').map(type => type.trim());
        const fileType =
          file instanceof File ? file.type || String() : file.type;
        const fileExtension = `.${file instanceof File ? file.name.split('.').pop() : file.name.split('.').pop()}`;

        const isAccepted = acceptedTypes.some(type => {
          if (type.startsWith('.')) {
            return fileExtension.toLowerCase() === type.toLowerCase();
          }

          if (type.endsWith(`/${FILES.FILE.ACCEPT}`)) {
            const baseType = type.split('/')[0];
            return fileType.startsWith(`${baseType}/`);
          }

          return fileType === type;
        });

        if (!isAccepted) {
          return getFileErrorMessage({ file, name: 'type' });
        }
      }

      return null;
    },
    [accept, maxSize]
  );

  const createPreview = useCallback(
    (file: File | FileMetadata): string | undefined => {
      if (file instanceof File) {
        return URL.createObjectURL(file);
      }
      return file.url;
    },
    []
  );

  const generateUniqueId = useCallback(
    (file: File | FileMetadata): string =>
      file instanceof File ? ext(file) : file.id,
    []
  );

  const clearFiles = useCallback(() => {
    setState(prev => {
      for (const file of prev.files) {
        if (
          file.preview &&
          file.file instanceof File &&
          file.file.type.startsWith('image/')
        ) {
          URL.revokeObjectURL(file.preview);
        }
      }

      if (inputRef.current) {
        inputRef.current.value = String();
      }

      const newState = {
        ...prev,
        errors: [],
        files: []
      };

      onFilesChange?.(newState.files);
      return newState;
    });
  }, [onFilesChange]);

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      if (!newFiles || newFiles.length === 0) return;

      const newFilesArray = Array.from(newFiles);
      const errors: string[] = [];

      setState(prev => ({ ...prev, errors: [] }));

      if (!multiple) {
        clearFiles();
      }

      if (
        multiple &&
        maxFiles !== Number.POSITIVE_INFINITY &&
        state.files.length + newFilesArray.length > maxFiles
      ) {
        errors.push(getFileErrorMessage({ maxFiles, name: 'count' }));
        onError?.(errors);
        setState(prev => ({ ...prev, errors }));
        return;
      }

      const validFiles: FileWithPreview[] = [];

      for (const file of newFilesArray) {
        if (multiple) {
          const isDuplicate = state.files.some(
            existingFile =>
              existingFile.file.name === file.name &&
              existingFile.file.size === file.size
          );

          if (isDuplicate) {
            return;
          }
        }

        if (file.size > maxSize) {
          errors.push(
            getFileErrorMessage({
              file,
              maxSize: formatBytes(maxSize),
              name: 'size'
            })
          );
          continue;
        }

        const error = validateFile(file);

        if (error) {
          errors.push(error);
        }

        if (!error) {
          validFiles.push({
            file,
            id: generateUniqueId(file),
            preview: createPreview(file)
          });
        }
      }

      if (validFiles.length > 0) {
        onFilesAdded?.(validFiles);

        setState(prev => {
          const newFiles = !multiple
            ? validFiles
            : [...prev.files, ...validFiles];
          onFilesChange?.(newFiles);
          return {
            ...prev,
            errors,
            files: newFiles
          };
        });
      }

      if (errors.length > 0) {
        onError?.(errors);
        setState(prev => ({
          ...prev,
          errors
        }));
      }

      if (inputRef.current) inputRef.current.value = String();
    },
    [
      multiple,
      maxFiles,
      state.files,
      clearFiles,
      onError,
      maxSize,
      validateFile,
      generateUniqueId,
      createPreview,
      onFilesAdded,
      onFilesChange
    ]
  );

  const removeFile = useCallback(
    (id: string) => {
      setState(prev => {
        const fileToRemove = prev.files.find(file => file.id === id);
        if (
          fileToRemove &&
          fileToRemove.preview &&
          fileToRemove.file instanceof File &&
          fileToRemove.file.type.startsWith('image/')
        ) {
          URL.revokeObjectURL(fileToRemove.preview);
        }

        const newFiles = prev.files.filter(file => file.id !== id);
        onFilesChange?.(newFiles);

        return {
          ...prev,
          errors: [],
          files: newFiles
        };
      });
    },
    [onFilesChange]
  );

  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: []
    }));
  }, []);

  const handleDragEnter = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setState(prev => ({ ...prev, isDragging: true }));
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }

    setState(prev => ({ ...prev, isDragging: false }));
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setState(prev => ({ ...prev, isDragging: false }));

      if (inputRef.current?.disabled) {
        return;
      }

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        return !multiple
          ? addFiles([e.dataTransfer.files[0]])
          : addFiles(e.dataTransfer.files);
      }
    },
    [addFiles, multiple]
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(Array.from(e.target.files).map(f => new File([f], ext(f), f)));
      }
    },
    [addFiles]
  );

  const openFileDialog = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  }, []);

  const getInputProps = useCallback(
    (props: InputHTMLAttributes<HTMLInputElement> = {}) => {
      return {
        ...props,
        accept: props.accept || accept,
        multiple: props.multiple !== undefined ? props.multiple : multiple,
        onChange: handleFileChange,
        ref: inputRef,
        type: 'file' as const
      };
    },
    [accept, multiple, handleFileChange]
  );

  return [
    state,
    {
      addFiles,
      clearErrors,
      clearFiles,
      getInputProps,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      handleFileChange,
      openFileDialog,
      removeFile
    }
  ];
};
