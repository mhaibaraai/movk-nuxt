import { queryCollection } from '@nuxt/content/server'

export default defineMcpTool({
  description: '列出所有可用的 Movk Nuxt 组合式函数和基本信息',
  cache: '1h',
  async handler() {
    const event = useEvent()
    const composables = await queryCollection(event, 'docs')
      .where('path', 'LIKE', '%/composables/%')
      .where('extension', '=', 'md')
      .select('path', 'title', 'description')
      .all()

    return jsonResult(composables)
  }
})
