import { queryCollection } from '@nuxt/content/server'

export default defineMcpResource({
  uri: 'resource://movk-nuxt/components',
  description: 'Movk Nuxt 可用组件完整列表，包含元数据和分类信息',
  cache: '1h',
  async handler(uri: URL) {
    const event = useEvent()

    const components = await queryCollection(event, 'docs')
      .where('path', 'LIKE', '%/components/%')
      .where('extension', '=', 'md')
      .select('path', 'title', 'description', 'category')
      .all()

    return {
      contents: [{
        uri: uri.toString(),
        mimeType: 'application/json',
        text: JSON.stringify(components, null, 2)
      }]
    }
  }
})
