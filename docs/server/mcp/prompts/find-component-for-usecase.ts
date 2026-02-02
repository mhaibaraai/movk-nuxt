import { z } from 'zod'
import { queryCollection } from '@nuxt/content/server'

export default defineMcpPrompt({
  description: '为特定使用场景找到最适合的 Movk Nuxt 组件',
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

    return {
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `帮我找到最适合这个使用场景的 Movk Nuxt 组件：「${usecase}」。以下是所有可用的组件：${JSON.stringify(components, null, 2)}`
          }
        }
      ]
    }
  }
})
