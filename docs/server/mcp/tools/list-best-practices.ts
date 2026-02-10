import { queryCollection } from '@nuxt/content/server'

export default defineMcpTool({
  description: '列出所有可用的 Movk Nuxt 最佳实践指南',
  cache: '1h',
  async handler() {
    const event = useEvent()
    const bestPractices = await queryCollection(event, 'docs')
      .where('path', 'LIKE', '%/best-practices/%')
      .where('extension', '=', 'md')
      .select('path', 'title', 'description')
      .all()

    return jsonResult(bestPractices)
  }
})
