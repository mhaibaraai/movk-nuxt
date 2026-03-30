import type { UserCreateReq, UserUpdateReq, ResetPasswordReq } from './types'

export function useUserApi() {
  const { $api } = useNuxtApp()

  return {
    create: (body: UserCreateReq) =>
      $api<string>('/v1/system/users', { method: 'POST', body }),

    update: (id: string, body: UserUpdateReq) =>
      $api(`/v1/system/users/${id}`, { method: 'PUT', body }),

    remove: (id: string) =>
      $api(`/v1/system/users/${id}`, { method: 'DELETE' }),

    removeBatch: (ids: string[]) =>
      $api('/v1/system/users', { method: 'DELETE', body: ids }),

    resetPassword: (body: ResetPasswordReq) =>
      $api('/v1/system/users/reset-password', { method: 'PUT', body }),

    getById: (id: string) =>
      $api<UserDetailResp>(`/v1/system/users/${id}`),

    assignRoles: (userId: string, roleIds: string[]) =>
      $api(`/v1/system/users/${userId}/roles`, { method: 'POST', body: roleIds }),

    assignPosts: (userId: string, postIds: string[]) =>
      $api(`/v1/system/users/${userId}/posts`, { method: 'POST', body: postIds })
  }
}
