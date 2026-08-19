/** 网关侧的业务错误：HTTP 200 + code 500 信封，验证流式请求仍走业务码校验 */
export default defineEventHandler(() => ({
  code: 500,
  message: '会话不存在',
  data: null
}))
