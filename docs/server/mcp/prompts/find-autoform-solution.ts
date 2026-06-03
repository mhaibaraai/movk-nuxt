import { z } from 'zod'
import { queryCollection } from '@nuxt/content/server'

export default defineMcpPrompt({
  description: 'Find the most suitable AutoForm field types, configuration and customization approach for a form requirement',
  inputSchema: {
    requirement: z.string().describe('Describe your form requirement (e.g. "a sign-up form with username, email, password and confirm password", "a product form with name, price, category and image upload")')
  },
  async handler({ requirement }) {
    const event = useEvent()

    const autoFormDocs = await queryCollection(event, 'docs')
      .where('path', 'LIKE', '%/auto-form/%')
      .where('extension', '=', 'md')
      .select('path', 'title', 'description', 'category')
      .all()

    return {
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `I need to build the following form: "${requirement}".

Based on the requirement, please recommend:
1. The most suitable field types (String, Number, Boolean, Date, Enum, Array, Object, File)
2. Any customization that may be needed (conditional rendering, collapsible panels, custom controls, layout, etc.)
3. Relevant slot usage (if heavy customization is required)

Here are all available AutoForm documentation pages:

${JSON.stringify(autoFormDocs, null, 2)}

Please provide:
- A recommended Zod schema structure
- The field configuration to use
- Example code (if applicable)
- Relevant documentation links`
          }
        }
      ]
    }
  }
})
