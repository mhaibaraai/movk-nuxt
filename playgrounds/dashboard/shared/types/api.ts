// 通用分页响应
export interface PageResp<T> {
  content: T[]
  page: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
  traceId: string
  timestamp: number
}
