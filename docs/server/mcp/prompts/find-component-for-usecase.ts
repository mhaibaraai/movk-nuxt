import { z } from 'zod'
import { queryCollection } from '@nuxt/content/server'

export default defineMcpPrompt({
  description: '为特定使用场景找到最适合的 Movk Nuxt 组件（涵盖独立 UI 组件与 DataTable 表格章节）',
  inputSchema: {
    usecase: z.string().describe('描述你想构建的内容（例如：「用户登录表单」「数据表格」「导航菜单」）')
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
            text: `帮我找到最适合这个使用场景的 Movk Nuxt 组件：「${usecase}」。候选集包含独立 UI 组件（category: input/feedback/form/advanced）与 DataTable 章节文档页（category: data-table）：${JSON.stringify(candidates, null, 2)}`
          }
        }
      ]
    }
  }
})
