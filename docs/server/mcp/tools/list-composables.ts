import { queryCollection } from '@nuxt/content/server'

export default defineMcpTool({
  description: 'List all available Movk Nuxt composables with basic info',
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

    const composables = await queryCollection(event, 'docs')
      .where('path', 'LIKE', '%/composables/%')
      .where('extension', '=', 'md')
      .select('path', 'title', 'description')
      .all()

    return composables.map(composable => ({
      name: composable.path.split('/').pop(),
      title: composable.title,
      description: composable.description,
      url: `${siteUrl}${composable.path}`
    }))
  }
})
