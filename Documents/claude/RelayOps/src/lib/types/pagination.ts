// 通用分页类型和工具函数

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

// 规范化分页参数：处理边界值（负数、0、超大数）
export function normalizePagination(
  params?: PaginationParams,
  defaultSize = DEFAULT_PAGE_SIZE
): { page: number; pageSize: number; offset: number } {
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, params?.pageSize ?? defaultSize)
  )
  const page = Math.max(1, Math.floor(params?.page ?? 1))
  const offset = (page - 1) * pageSize

  return { page, pageSize, offset }
}

// 构建分页结果：data 为空时 total 归 0，page 超范围返回空数组
export function buildPaginatedResult<T>(
  data: T[],
  total: number | null,
  page: number,
  pageSize: number
): PaginatedResult<T> {
  const safeTotal = total ?? 0
  const totalPages = Math.max(1, Math.ceil(safeTotal / pageSize))

  return {
    data,
    total: safeTotal,
    page,
    pageSize,
    totalPages,
  }
}
