import { z } from 'zod/v4'
import { queryCollection } from '@nuxt/content/server'

export default defineMcpPrompt({
  description: '根据表单需求找到最适合的 AutoForm 字段类型、配置和自定义方案',
  inputSchema: {
    requirement: z.string().describe('描述你的表单需求（例如：「用户注册表单，需要用户名、邮箱、密码和确认密码」「产品信息表单，包含名称、价格、分类和图片上传」）')
  },
  async handler({ requirement }) {
    const event = useEvent()

    const autoFormDocs = await queryCollection(event, 'docs')
      .where('path', 'LIKE', '%/auto-form/%')
      .where('extension', '=', 'md')
      .select('path', 'title', 'description', 'category')
      .all()

    const fieldTypes = autoFormDocs.filter(doc => doc.path.includes('/field/'))
    const slots = autoFormDocs.filter(doc => doc.path.includes('/slots/'))
    const customizations = autoFormDocs.filter(doc => doc.path.includes('/customization/'))
    const basics = autoFormDocs.filter(doc =>
      !doc.path.includes('/field/')
      && !doc.path.includes('/slots/')
      && !doc.path.includes('/customization/')
    )

    return {
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `我需要构建以下表单：「${requirement}」

请根据需求推荐：
1. 最适合的字段类型（String、Number、Boolean、Date、Enum、Array、Object、File）
2. 可能需要的自定义配置（条件渲染、折叠面板、自定义控件、布局等）
3. 相关的插槽使用方法（如果需要高度自定义）

以下是所有可用的 AutoForm 文档资源：

**基础文档**：
${JSON.stringify(basics, null, 2)}

**字段类型**：
${JSON.stringify(fieldTypes, null, 2)}

**插槽系统**：
${JSON.stringify(slots, null, 2)}

**自定义功能**：
${JSON.stringify(customizations, null, 2)}

请提供：
- 推荐的 Zod Schema 结构
- 需要使用的字段配置
- 示例代码（如果适用）
- 相关文档链接`
          }
        }
      ]
    }
  }
})
