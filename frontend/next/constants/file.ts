import { env } from '@/lib/utils';

export const DIRECTORIES = {
  PUBLIC: env('PUBLIC', '/public')
};

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
  }
};
