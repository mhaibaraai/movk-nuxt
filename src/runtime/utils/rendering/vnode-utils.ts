import { Fragment, h, isVNode } from 'vue'

/**
 * 标准化节点值，确保返回可渲染的 VNode 数组
 * @param node 待标准化的节点
 * @returns 标准化后的 VNode 数组
 */
function normalize(node: any): any[] {
  if (node == null || node === false)
    return []

  if (Array.isArray(node))
    return node.flatMap(n => normalize(n))

  if (isVNode(node))
    return [node]

  const t = typeof node
  if (t === 'string' || t === 'number')
    return [node]

  // 其它对象不参与字符串化，避免触发 JSON.stringify 循环
  return []
}

/**
 * VNode 渲染组件
 * 用于渲染动态内容，自动处理节点标准化
 * @param props 包含 node 属性的 props 对象
 * @param props.node 待渲染的节点
 * @returns 渲染结果
 */
export function VNodeRender(props: { node: unknown }) {
  const children = normalize(props.node as any)
  if (children.length === 0)
    return null as any
  if (children.length === 1)
    return children[0] as any
  return h(Fragment, null, children)
}
