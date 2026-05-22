import { z } from 'zod'
import { queryCollection } from '@nuxt/content/server'

export default defineMcpTool({
  description: 'Search DataTable documentation pages by keyword (data columns, special columns, tree data, row behavior, appearance, pagination, load more, API)',
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false
  },
  inputSchema: {
    search: z.string().optional().describe('Search term to filter pages by name or description')
  },
  inputExamples: [
    { search: 'sorting' },
    { search: 'pagination' },
    { search: 'tree' }
  ],
  cache: '30m',
  async handler({ search }) {
    const event = useEvent()
    const siteUrl = getRequestURL(event).origin

    const pages = await queryCollection(event, 'docs')
      .where('path', 'LIKE', '/docs/data-table/%')
      .where('extension', '=', 'md')
      .select('id', 'title', 'description', 'path', 'links')
      .all()

    let results = pages.map(page => ({
      name: page.path.split('/').pop(),
      title: page.title,
      description: page.description,
      path: page.path,
      url: `${siteUrl}${page.path}`,
      links: page.links
    }))

    if (search) {
      const searchLower = search.toLowerCase()
      results = results.filter(page =>
        page.name?.toLowerCase().includes(searchLower)
        || page.title?.toLowerCase().includes(searchLower)
        || page.description?.toLowerCase().includes(searchLower)
      )
    }

    return {
      pages: results.sort((a, b) => (a.name || '').localeCompare(b.name || '')),
      total: results.length,
      filters: { search }
    }
  }
})
