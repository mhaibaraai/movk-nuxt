import { queryCollection } from '@nuxt/content/server'

export default defineMcpTool({
  description: '列出所有可用的 Movk Nuxt 最佳实践指南',
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

    const bestPractices = await queryCollection(event, 'docs')
      .where('path', 'LIKE', '%/best-practices/%')
      .where('extension', '=', 'md')
      .select('path', 'title', 'description')
      .all()

    return bestPractices.map(doc => ({
      title: doc.title,
      description: doc.description,
      url: `${siteUrl}${doc.path}`
    }))
  }
})
