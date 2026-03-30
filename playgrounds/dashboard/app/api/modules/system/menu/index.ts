import type { MenuCreateReq, MenuUpdateReq } from './types'

export function useMenuApi() {
  const { $api } = useNuxtApp()

  return {
    create: (body: MenuCreateReq) =>
      $api<string>('/v1/system/menus', { method: 'POST', body }),

    update: (id: string, body: MenuUpdateReq) =>
      $api(`/v1/system/menus/${id}`, { method: 'PUT', body }),

    remove: (id: string) =>
      $api(`/v1/system/menus/${id}`, { method: 'DELETE' }),

    getById: (id: string) =>
      $api<MenuResp>(`/v1/system/menus/${id}`)
  }
}
