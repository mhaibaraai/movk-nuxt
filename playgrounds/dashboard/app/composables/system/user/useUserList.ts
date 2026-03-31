export function useUserList() {
  // const query = ref<UserListQuery>({
  //   page: 0,
  //   size: 20
  // })

  const { pending, refresh } = useApiFetch<PageResp<UserResp>>(
    '/v1/system/users',
    {
      // query,
      // watch: [query],
      toast: false
    }
  )

  return {
    // query: readonly(query),
    pending,
    refresh
  }
}
