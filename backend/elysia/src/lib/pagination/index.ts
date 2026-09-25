import { toPositiveInteger } from '@/lib/util';
import { env } from '@/lib/config';

export type PaginateOptions<T> = {
  getData: (params: { offset: number; limit: number }) => Promise<T[]>;
  getTotal: () => Promise<number>;
  maxPageSize?: number;
  pageSize?: unknown;
  page?: unknown;
};

export type PaginationResult<T> = {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  totalPages: number;
  pageSize: number;
  total: number;
  page: number;
  data: T[];
};

export async function paginate<T>({
  maxPageSize = env.MAX_PAGE_SIZE,
  pageSize: rawPageSize,
  page: rawPage,
  getTotal,
  getData
}: PaginateOptions<T>) {
  const requestedPageSize = toPositiveInteger(
    rawPageSize,
    env.DEFAULT_PAGE_SIZE
  );

  const pageSize = Math.min(requestedPageSize, maxPageSize);
  const page = toPositiveInteger(rawPage, env.DEFAULT_PAGE_NUMBER);
  const offset = (page - 1) * pageSize;

  const [data, total] = await Promise.all([
    getData({ limit: pageSize, offset }),
    getTotal()
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    totalPages,
    pageSize,
    total,
    data,
    page
  } as PaginationResult<T>;
}
