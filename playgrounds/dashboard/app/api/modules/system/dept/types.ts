export interface DeptCreateReq {
  parentId?: string
  deptName: string
  deptCode?: string
  orderNum?: number
  leaderUserId?: string
  phone?: string
  email?: string
  status?: 'ENABLED' | 'DISABLED'
}

export type DeptUpdateReq = DeptCreateReq
