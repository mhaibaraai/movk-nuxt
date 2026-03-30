import type { DeptCreateReq, DeptUpdateReq } from './types'

export function useDeptApi() {
  const { $api } = useNuxtApp()

  return {
    create: (body: DeptCreateReq) =>
      $api<string>('/v1/system/depts', { method: 'POST', body }),

    update: (id: string, body: DeptUpdateReq) =>
      $api(`/v1/system/depts/${id}`, { method: 'PUT', body }),

    remove: (id: string) =>
      $api(`/v1/system/depts/${id}`, { method: 'DELETE' }),

    getById: (id: string) =>
      $api<DeptResp>(`/v1/system/depts/${id}`),

    getChildIds: (id: string) =>
      $api<string[]>(`/v1/system/depts/${id}/children-ids`)
  }
}
