// 通用分页响应（Spring Data Page 结构）
export interface PageResp<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
  numberOfElements: number
}
