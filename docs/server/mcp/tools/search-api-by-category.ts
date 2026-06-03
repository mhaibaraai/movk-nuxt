import { z } from 'zod'
import { queryCollection } from '@nuxt/content/server'

export default defineMcpTool({
  description: 'Search API system docs by category or text',
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false
  },
  inputSchema: {
    category: z.string().optional().describe('Filter API docs by category'),
    search: z.string().optional().describe('Search term to filter API docs by name or description')
  },
  inputExamples: [
    { search: 'useApiFetch' },
    { search: 'progress' }
  ],
  cache: '30m',
  async handler({ category, search }) {
    const event = useEvent()
    const siteUrl = getRequestURL(event).origin

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
      url: `${siteUrl}${doc.path}`,
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

    return {
      docs: results.sort((a, b) => (a.name || '').localeCompare(b.name || '')),
      total: results.length,
      filters: { category, search }
    }
  }
})
