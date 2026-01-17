import { queryCollection } from '@nuxt/content/server'

export default defineMcpTool({
  description: '列出所有文档页面',
  cache: '1h',
  async handler() {
    const event = useEvent()

    const pages = await queryCollection(event, 'docs').all()

    return jsonResult(pages.map(doc => ({
      title: doc.title,
      description: doc.description,
      path: doc.path
    })))
  }
})
