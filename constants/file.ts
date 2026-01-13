import { env } from '@/lib/utils';

export const DIRECTORIES = {
  PUBLIC: env('PUBLIC', '/public')
};

export const FILES = {
  COVER: {
    ACCEPT: 'image/*',
    MAX_SIZE: 5 * 1024 * 1024,
    TYPE: 'image/jpg'
  },
  FILE: {
    ACCEPT: '*',
    MAX_SIZE: 2 * 1024 * 1024,
    TYPE: 'image/jpg'
  },
  IMAGE: {
    ACCEPT: 'image/*',
    MAX_SIZE: 2 * 1024 * 1024,
    TYPE: 'image/jpg'
  }
};
