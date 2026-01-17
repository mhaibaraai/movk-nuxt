import { queryCollection } from '@nuxt/content/server'

export default defineMcpResource({
  uri: 'resource://movk-nuxt/auto-form',
  description: 'Movk Nuxt AutoForm 自动表单系统完整文档，包含配置、API、字段定义和自定义选项',
  cache: '1h',
  async handler(uri: URL) {
    const event = useEvent()

    const autoFormDocs = await queryCollection(event, 'docs')
      .where('path', 'LIKE', '%/auto-form/%')
      .where('extension', '=', 'md')
      .select('path', 'title', 'description', 'category')
      .all()

    return {
      contents: [{
        uri: uri.toString(),
        mimeType: 'application/json',
        text: JSON.stringify(autoFormDocs, null, 2)
      }]
    }
  }
})
