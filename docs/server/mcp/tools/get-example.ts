import { z } from 'zod/v4'

export default defineMcpTool({
  description: '获取特定 UI 示例的实现代码和详细信息',
  inputSchema: {
    exampleName: z.string().describe('示例的名称（使用 AutoFormBasicExample）')
  },
  cache: '30m',
  async handler({ exampleName }) {
    try {
      const result = await $fetch<{ code: string }>(`/api/component-example/${exampleName}.json`)
      return {
        content: [{ type: 'text' as const, text: result.code }]
      }
    } catch {
      return errorResult(`未找到示例「${exampleName}」。请使用 list_examples 工具查看所有可用示例。`)
    }
  }
})
