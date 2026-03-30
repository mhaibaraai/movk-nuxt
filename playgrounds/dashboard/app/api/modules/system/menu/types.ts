export interface MenuCreateReq {
  parentId?: string
  type: 'DIRECTORY' | 'MENU' | 'BUTTON'
  name: string
  orderNum?: number
  path?: string
  component?: string
  queryParams?: string
  isFrame?: boolean
  isCache?: boolean
  permissionCode?: string
  visible?: boolean
  status?: 'ENABLED' | 'DISABLED'
  icon?: string
  remark?: string
}

export type MenuUpdateReq = MenuCreateReq
