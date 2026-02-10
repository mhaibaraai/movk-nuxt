import { queryCollection } from '@nuxt/content/server'

export default defineMcpTool({
  description: '列出所有可用的 Movk Nuxt API 系统文档，包含插件、Hooks 和 Composables',
  cache: '1h',
  async handler() {
    const event = useEvent()
    const apiDocs = await queryCollection(event, 'docs')
      .where('path', 'LIKE', '%/api/%')
      .where('extension', '=', 'md')
      .select('path', 'title', 'description')
      .all()

    return jsonResult(apiDocs)
  }
})
