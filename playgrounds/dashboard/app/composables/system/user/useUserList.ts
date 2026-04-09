import type { UserListQuery } from '@/api/system/user/types'
import { USER_STATUS } from '~/constants/system'

export function useUserList() {
  const formatter = useDateFormatter()
  const { afz } = useAutoForm()

  const query = ref<UserListQuery>({
    page: 0,
    size: 20
  })

  const searchSchema = afz.object<UserListQuery>()({
    username: afz.string({ type: 'withFloatingLabel', controlProps: { label: '用户名', icon: 'i-lucide-user' } }),
    nickname: afz.string({ type: 'withFloatingLabel', controlProps: { label: '昵称', icon: 'i-lucide-user' } }),
    phone: afz.string({ type: 'asPhoneNumberInput', controlProps: { icon: 'i-lucide-phone' } }),
    email: afz.string({ type: 'withFloatingLabel', controlProps: { label: '邮箱', icon: 'i-lucide-mail' } }),
    status: afz.enum(USER_STATUS, { controlProps: { placeholder: '状态' } }),
    deptId: afz.string({ type: 'withFloatingLabel', controlProps: { label: '部门ID', icon: 'i-lucide-building' } }),
    createdAtStart: afz.calendarDate({ controlProps: { range: true, numberOfMonths: 2, labelFormat: 'iso', placeholder: '创建时间' } }).transform(date => formatter.convertToISO(date))
  })

  const { pending, refresh } = useApiFetch<PageResp<UserResp>>(
    '/v1/system/users',
    {
      query,
      watch: [query],
      toast: false
    }
  )

  return {
    // query: readonly(query),
    searchSchema,
    pending,
    refresh
  }
}
