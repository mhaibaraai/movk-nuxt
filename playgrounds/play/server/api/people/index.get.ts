import { makePerson } from '../../utils/people'
import type { Person } from '../../utils/people'
import { z } from 'zod'

const columns = ['id', 'name', 'email', 'department', 'role', 'level', 'status', 'salary', 'joinedAt'] as const
const exportQuery = z.object({
  columns: z.string().transform(value => value.split(',')).pipe(z.array(z.enum(columns)).min(1)),
  keyword: z.string().optional(),
  sortBy: z.enum(columns).optional(),
  sortDir: z.enum(['asc', 'desc']).optional()
})

function csvResponse(rows: Person[], fields: readonly (keyof Person)[]): string {
  return [fields.join(','), ...rows.map(row => fields.map(field => `"${String(row[field]).replaceAll('"', '""')}"`).join(','))].join('\r\n')
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const csv = query.format === 'csv' ? await getValidatedQuery(event, exportQuery.parse) : undefined
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

  if (csv) {
    setResponseHeader(event, 'content-type', 'text/csv; charset=utf-8')
    setResponseHeader(event, 'content-disposition', 'attachment; filename="people.csv"')
    return '\uFEFF' + csvResponse(filtered, csv.columns)
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
