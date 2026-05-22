import { queryCollection } from '@nuxt/content/server'

export default defineMcpTool({
  description: '列出 Movk Nuxt DataTable 章节的全部文档页（数据列、特殊列、树形、行为、外观、分页、加载更多、API）',
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
