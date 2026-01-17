// @ts-expect-error - no types available
import components from '#component-example/nitro'

export default defineMcpResource({
  uri: 'resource://movk-nuxt/examples',
  description: 'Movk Nuxt 可用示例代码和演示完整列表',
  cache: '1h',
  handler(uri: URL) {
    const examples = Object.entries<{ pascalName: string }>(components).map(([_key, value]) => {
      return value.pascalName
    })

    return {
      contents: [{
        uri: uri.toString(),
        mimeType: 'application/json',
        text: JSON.stringify(examples, null, 2)
      }]
    }
  }
})
