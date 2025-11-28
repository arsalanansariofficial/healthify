import { env } from '@/lib/utils';

export const DIRECTORIES = { PUBLIC: env('PUBLIC', '/public') };

export const FILES = {
  COVER: {
    ACCEPT: 'image/*',
    ID: 'cover',
    MAX_FILES: 1,
    MAX_SIZE: 5 * 1024 * 1024,
    TYPE: 'image/jpg'
  },
  FILE: {
    ACCEPT: '*',
    ID: 'file',
    MAX_FILES: 5,
    MAX_SIZE: 2 * 1024 * 1024,
    TYPE: 'image/jpg'
  },
  IMAGE: {
    ACCEPT: 'image/*',
    ID: 'image',
    MAX_FILES: 1,
    MAX_SIZE: 2 * 1024 * 1024,
    TYPE: 'image/jpg'
  },
  PDF: {
    ACCEPT: 'application/pdf',
    ID: 'pdf',
    MAX_FILES: 10,
    MAX_SIZE: 2 * 1024 * 1024,
    TYPE: 'application/pdf'
  },
  UNITS: {
    KILO_BYTE: 1024,
    SIZES: ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  }
};
