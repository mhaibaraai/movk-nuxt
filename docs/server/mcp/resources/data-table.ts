import { queryCollection } from '@nuxt/content/server'

export default defineMcpResource({
  uri: 'resource://movk-nuxt/data-table',
  description: 'Movk Nuxt DataTable 文档章节的完整页面列表与元数据',
  cache: '1h',
  async handler(uri: URL) {
    const event = useEvent()

    const pages = await queryCollection(event, 'docs')
      .where('path', 'LIKE', '%/data-table/%')
      .where('extension', '=', 'md')
      .select('path', 'title', 'description')
      .all()

    return {
      contents: [{
        uri: uri.toString(),
        mimeType: 'application/json',
        text: JSON.stringify(pages, null, 2)
      }]
    }
  }
})
