export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  statusCode: number;
  timestamp?: Date;
}

export interface PagedResult<T> {
  items: T[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  error: string;
  errors?: { [key: string]: string[] };
  statusCode: number;
  timestamp: Date;
}