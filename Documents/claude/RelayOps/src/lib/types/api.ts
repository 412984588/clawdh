export interface ServerActionResult<T = void> {
  success: boolean
  data?: T
  error?: string | Record<string, string[]>
}

export interface PaginatedResult<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
}
