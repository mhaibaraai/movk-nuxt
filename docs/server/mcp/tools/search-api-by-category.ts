import { z } from 'zod'
import { queryCollection } from '@nuxt/content/server'

export default defineMcpTool({
  description: '按分类或文本筛选搜索 API 系统文档',
  inputSchema: {
    category: z.string().optional().describe('按分类筛选 API 文档'),
    search: z.string().optional().describe('用于按名称或描述筛选 API 文档的搜索词')
  },
  cache: '30m',
  async handler({ category, search }) {
    const event = useEvent()

    let query = queryCollection(event, 'docs')
      .where('path', 'LIKE', '/docs/api/%')
      .where('extension', '=', 'md')
      .select('id', 'title', 'description', 'path', 'category', 'links')

    if (category) {
      query = query.where('category', '=', category)
    }

    const docs = await query.all()

    let results = docs.map(doc => ({
      name: doc.path.split('/').pop(),
      title: doc.title,
      description: doc.description,
      category: doc.category,
      path: doc.path,
      url: `https://nuxt.mhaibaraai.cn${doc.path}`,
      links: doc.links
    }))

    if (search) {
      const searchLower = search.toLowerCase()
      results = results.filter(doc =>
        doc.name?.toLowerCase().includes(searchLower)
        || doc.title?.toLowerCase().includes(searchLower)
        || doc.description?.toLowerCase().includes(searchLower)
      )
    }

    return jsonResult({
      docs: results.sort((a, b) => (a.name || '').localeCompare(b.name || '')),
      total: results.length,
      filters: { category, search }
    })
  }
})
