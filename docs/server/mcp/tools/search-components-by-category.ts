import { z } from 'zod'
import { queryCollection } from '@nuxt/content/server'

export default defineMcpTool({
  description: '按分类或文本筛选搜索组件',
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false
  },
  inputSchema: {
    category: z.string().optional().describe('按分类筛选组件'),
    search: z.string().optional().describe('用于按名称或描述筛选组件的搜索词')
  },
  inputExamples: [
    { category: 'input' },
    { category: 'advanced', search: 'color' }
  ],
  cache: '30m',
  async handler({ category, search }) {
    const event = useEvent()
    const siteUrl = getRequestURL(event).origin

    let query = queryCollection(event, 'docs')
      .where('path', 'LIKE', '/docs/components/%')
      .where('extension', '=', 'md')
      .select('id', 'title', 'description', 'path', 'category', 'links')

    if (category) {
      query = query.where('category', '=', category)
    }

    const components = await query.all()

    let results = components.map(component => ({
      name: component.path.split('/').pop(),
      title: component.title,
      description: component.description,
      category: component.category,
      path: component.path,
      url: `${siteUrl}${component.path}`,
      links: component.links
    }))

    if (search) {
      const searchLower = search.toLowerCase()
      results = results.filter(component =>
        component.name?.toLowerCase().includes(searchLower)
        || component.title?.toLowerCase().includes(searchLower)
        || component.description?.toLowerCase().includes(searchLower)
      )
    }

    return {
      components: results.sort((a, b) => (a.name || '').localeCompare(b.name || '')),
      total: results.length,
      filters: { category, search }
    }
  }
})
