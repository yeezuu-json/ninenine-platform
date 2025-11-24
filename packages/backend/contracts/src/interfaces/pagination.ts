export interface IPagination {
  limit: number;
  offset: number;
}

export interface IPaginatedResult<T> {
  total: number;
  items: T[];
  limit: number;
  offset: number;
}
