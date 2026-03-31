// 通用分页响应（Spring Data Page 结构）
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
