import { queryCollection } from '@nuxt/content/server'

export default defineMcpResource({
  uri: 'resource://movk-nuxt/best-practices',
  description: 'List of Movk Nuxt best-practice guides, including project structure and composable patterns',
  cache: '1h',
  async handler(uri: URL) {
    const event = useEvent()

    const bestPractices = await queryCollection(event, 'docs')
      .where('path', 'LIKE', '%/best-practices/%')
      .where('extension', '=', 'md')
      .select('path', 'title', 'description')
      .all()

    return {
      contents: [{
        uri: uri.toString(),
        mimeType: 'application/json',
        text: JSON.stringify(bestPractices, null, 2)
      }]
    }
  }
})
