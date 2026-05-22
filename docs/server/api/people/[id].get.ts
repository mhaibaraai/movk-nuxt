import { makePerson } from '../../utils/people'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') || ''
  const seed = Number(id.replace(/\D/g, '')) || 1

  await new Promise(r => setTimeout(r, 200 + Math.random() * 400))

  if (Math.random() < 0.1) {
    throw createError({ statusCode: 500, message: '服务暂不可用，请稍后重试' })
  }

  return {
    code: 200,
    message: 'ok',
    data: makePerson(seed)
  }
})
