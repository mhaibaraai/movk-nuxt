import { queryCollection } from '@nuxt/content/server'

export default defineMcpTool({
  description: 'List all Movk Nuxt DataTable documentation pages (data columns, special columns, tree data, row behavior, appearance, pagination, load more, API)',
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false
  },
  cache: '1h',
  async handler() {
    const event = useEvent()
    const siteUrl = getRequestURL(event).origin

    const pages = await queryCollection(event, 'docs')
      .where('path', 'LIKE', '%/data-table/%')
      .where('extension', '=', 'md')
      .select('path', 'title', 'description')
      .all()

    return pages.map(page => ({
      name: page.path.split('/').pop(),
      title: page.title,
      description: page.description,
      url: `${siteUrl}${page.path}`
    }))
  }
})
