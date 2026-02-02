import { z } from 'zod'

export default defineMcpTool({
  description: '通过 URL 路径获取文档页面内容',
  inputSchema: {
    path: z.string().describe('文档页面的路径（例如：/docs/components/star-rating）')
  },
  cache: '30m',
  async handler({ path }) {
    try {
      const result = await $fetch<string>(`/raw${path}.md`)
      return {
        content: [{ type: 'text' as const, text: result }]
      }
    } catch (error) {
      return errorResult(`获取文档页面失败：${error}`)
    }
  }
})
