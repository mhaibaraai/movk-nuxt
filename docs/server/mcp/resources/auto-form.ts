import { queryCollection } from '@nuxt/content/server'

export default defineMcpResource({
  uri: 'resource://movk-nuxt/auto-form',
  description: 'Complete Movk Nuxt AutoForm documentation, including configuration, API, field definitions and customization options',
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
