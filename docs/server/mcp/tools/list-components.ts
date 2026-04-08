import { queryCollection } from '@nuxt/content/server'

export default defineMcpTool({
  description: '列出所有可用的 Movk Nuxt 组件及其分类和基本信息',
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

    const components = await queryCollection(event, 'docs')
      .where('path', 'LIKE', '%/components/%')
      .where('extension', '=', 'md')
      .select('path', 'title', 'description', 'category')
      .all()

    return components.map(component => ({
      name: component.path.split('/').pop(),
      title: component.title,
      description: component.description,
      category: component.category,
      url: `${siteUrl}${component.path}`
    }))
  }
})
