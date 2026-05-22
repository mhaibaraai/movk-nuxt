import { makePerson } from '../../utils/people'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 10
  const keyword = String(query.keyword || '')
  const sortBy = String(query.sortBy || '')
  const sortDir = String(query.sortDir || 'asc')

  await new Promise(r => setTimeout(r, 300 + Math.random() * 500))

  const total = 200
  const all = Array.from({ length: total }, (_, i) => makePerson(i + 1))
  const filtered = keyword
    ? all.filter(p => p.name.includes(keyword) || p.email.includes(keyword) || p.role.includes(keyword))
    : all

  if (sortBy) {
    filtered.sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortBy]
      const bv = (b as unknown as Record<string, unknown>)[sortBy]
      const sign = sortDir === 'desc' ? -1 : 1
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sign
      return String(av).localeCompare(String(bv)) * sign
    })
  }

  const start = (page - 1) * pageSize
  const items = filtered.slice(start, start + pageSize)

  return {
    code: 200,
    message: 'ok',
    data: {
      items,
      total: filtered.length,
      page,
      pageSize
    }
  }
})
