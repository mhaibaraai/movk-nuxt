export function useToolCall() {
  const tools: Record<string, string | ((args: any) => string)> = {
    'list-pages': '列出所有文档页面',
    'list-components': '列出所有组件',
    'list-composables': '列出所有 Composables',
    'list-examples': '列出所有示例',
    'list-best-practices': '列出所有最佳实践',
    'list-getting-started-guides': '列出入门指南',
    'get-page': (args: any) => `检索 ${args?.path || '页面'}`,
    'get-example': (args: any) => `获取示例：${args?.exampleName || '示例'}`,
    'search-api-by-category': (args: any) => `搜索 API：${args?.search || args?.category || '全部'}`,
    'search-auto-form-by-category': (args: any) => `搜索 AutoForm：${args?.search || args?.category || '全部'}`,
    'search-components-by-category': (args: any) => `搜索组件：${args?.search || args?.category || '全部'}`
  }

  return {
    tools
  }
}
