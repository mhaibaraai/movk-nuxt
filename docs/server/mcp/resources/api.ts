import { queryCollection } from '@nuxt/content/server'

export default defineMcpResource({
  uri: 'resource://movk-nuxt/api',
  description: 'Complete list of Movk Nuxt API system docs, including plugin config, hooks, composables and upload/download with progress',
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
