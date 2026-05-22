import { z } from 'zod'
import { queryCollection } from '@nuxt/content/server'

export default defineMcpPrompt({
  description: 'Find the most suitable Movk Nuxt component for a specific use case (covering standalone UI components and the DataTable section)',
  inputSchema: {
    usecase: z.string().describe('Describe what you want to build (e.g. "user login form", "data table", "navigation menu")')
  },
  async handler({ usecase }) {
    const event = useEvent()

    const components = await queryCollection(event, 'docs')
      .where('path', 'LIKE', '%/components/%')
      .where('extension', '=', 'md')
      .select('path', 'title', 'description', 'category')
      .all()

    const dataTable = await queryCollection(event, 'docs')
      .where('path', 'LIKE', '%/data-table/%')
      .where('extension', '=', 'md')
      .select('path', 'title', 'description')
      .all()

    const candidates = [
      ...components,
      ...dataTable.map(page => ({ ...page, category: 'data-table' }))
    ]

    return {
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `Find the most suitable Movk Nuxt component for this use case: "${usecase}". The candidate set includes standalone UI components (category: input/feedback/form/advanced) and DataTable section pages (category: data-table): ${JSON.stringify(candidates, null, 2)}`
          }
        }
      ]
    }
  }
})
