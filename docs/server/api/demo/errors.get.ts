export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const type = String(query.type || 'business')

  await new Promise(r => setTimeout(r, 200))

  if (type === '401') {
    throw createError({ statusCode: 401, message: '未授权' })
  }

  if (type === '422') {
    throw createError({
      statusCode: 422,
      message: '参数校验失败',
      data: { fields: { email: '邮箱格式不正确' } }
    })
  }

  if (type === 'network') {
    event.node.res.destroy()
    return
  }

  if (type === '500') {
    throw createError({ statusCode: 500, message: '服务器内部错误' })
  }

  return {
    code: 4001,
    message: '业务错误：余额不足',
    data: null
  }
})
