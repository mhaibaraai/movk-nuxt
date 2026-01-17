import { queryCollection } from '@nuxt/content/server'

export default defineMcpResource({
  uri: 'resource://movk-nuxt/composables',
  description: 'Movk Nuxt 可用组合式函数完整列表，包含元数据和分类信息',
  cache: '1h',
  async handler(uri: URL) {
    const event = useEvent()

    const composables = await queryCollection(event, 'docs')
      .where('path', 'LIKE', '%/composables/%')
      .where('extension', '=', 'md')
      .select('path', 'title', 'description')
      .all()

    return {
      contents: [{
        uri: uri.toString(),
        mimeType: 'application/json',
        text: JSON.stringify(composables, null, 2)
      }]
    }
  }
})
