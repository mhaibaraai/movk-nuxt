import { queryCollection } from '@nuxt/content/server'

export default defineMcpTool({
  description: '列出所有可用的 Movk Nuxt 组件及其分类和基本信息',
  cache: '1h',
  async handler() {
    const event = useEvent()
    const components = await queryCollection(event, 'docs')
      .where('path', 'LIKE', '%/components/%')
      .where('extension', '=', 'md')
      .select('path', 'title', 'description', 'category')
      .all()

    return jsonResult(components)
  }
})
