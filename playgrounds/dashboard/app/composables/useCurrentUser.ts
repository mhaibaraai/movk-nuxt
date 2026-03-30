import type { AuthMePayload } from '#shared/types/auth'

export function useCurrentUser() {
  const currentUser = useState<AuthMePayload | null>('current-user', () => null)
  const { $api } = useNuxtApp()

  async function fetchCurrentUser() {
    const data = await $api<AuthMePayload>('/v1/auth/me', {
      context: { toast: false }
    })
    currentUser.value = data
  }

  function setCurrentUser(data: AuthMePayload) {
    currentUser.value = data
  }

  function clearCurrentUser() {
    currentUser.value = null
  }

  return {
    currentUser: readonly(currentUser),
    fetchCurrentUser,
    setCurrentUser,
    clearCurrentUser
  }
}
