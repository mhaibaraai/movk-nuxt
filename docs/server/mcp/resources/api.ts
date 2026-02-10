import { queryCollection } from '@nuxt/content/server'

export default defineMcpResource({
  uri: 'resource://movk-nuxt/api',
  description: 'Movk Nuxt API 系统完整文档列表，包含插件配置、Hooks、Composables 和进度上传/下载',
  cache: '1h',
  async handler(uri: URL) {
    const event = useEvent()

    const apiDocs = await queryCollection(event, 'docs')
      .where('path', 'LIKE', '%/api/%')
      .where('extension', '=', 'md')
      .select('path', 'title', 'description')
      .all()

    return {
      contents: [{
        uri: uri.toString(),
        mimeType: 'application/json',
        text: JSON.stringify(apiDocs, null, 2)
      }]
    }
  }
})
