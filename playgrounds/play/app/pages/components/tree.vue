<script setup lang="ts">
import type { SemanticColor, SemanticSize, TreeItem } from '@movk/nuxt'

const sizes: SemanticSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
const colors: SemanticColor[] = ['primary', 'info', 'warning', 'neutral', 'error', 'success']

const attrs = ref({
  size: ['md'] as SemanticSize[],
  color: ['primary'] as SemanticColor[]
})

const fileTree: TreeItem[] = [
  {
    label: 'app',
    icon: 'i-lucide-folder',
    defaultExpanded: true,
    children: [
      {
        label: 'composables',
        icon: 'i-lucide-folder',
        children: [
          { label: 'useAuth.ts', icon: 'i-vscode-icons-file-type-typescript' },
          { label: 'useUser.ts', icon: 'i-vscode-icons-file-type-typescript' }
        ]
      },
      {
        label: 'components',
        icon: 'i-lucide-folder',
        children: [
          { label: 'Card.vue', icon: 'i-vscode-icons-file-type-vue' },
          { label: 'Button.vue', icon: 'i-vscode-icons-file-type-vue' }
        ]
      }
    ]
  },
  { label: 'app.vue', icon: 'i-vscode-icons-file-type-vue' },
  { label: 'nuxt.config.ts', icon: 'i-vscode-icons-file-type-nuxt' }
]

const basicValue = ref<TreeItem>()
const searchValue = ref<TreeItem>()
const checkedValue = ref<TreeItem[]>([])
const toolbarChecked = ref<TreeItem[]>([])

const deptTree = [
  {
    name: '技术中心',
    nodes: [
      { name: '前端组', nodes: [{ name: '组件库' }, { name: '可视化' }] },
      { name: '后端组' }
    ]
  },
  { name: '产品中心', nodes: [{ name: '交互设计' }] }
]
const deptValue = ref()

const lazyTree: TreeItem[] = [
  { label: '区域 A' },
  { label: '区域 B' },
  { label: '直辖节点', isLeaf: true }
]
let lazySeq = 0
function loadChildren(node: TreeItem): Promise<TreeItem[]> {
  return new Promise(resolve => setTimeout(() => {
    lazySeq += 1
    resolve([
      { label: `${node.label} / 子节点 ${lazySeq}-1` },
      { label: `${node.label} / 子节点 ${lazySeq}-2`, isLeaf: true }
    ])
  }, 800))
}

const bigTree: TreeItem[] = Array.from({ length: 60 }, (_, group) => ({
  label: `分组 ${group + 1}`,
  defaultExpanded: group === 0,
  children: Array.from({ length: 30 }, (_, leaf) => ({ label: `节点 ${group + 1}-${leaf + 1}` }))
}))

const matrixValue = ref<TreeItem>()
</script>

<template>
  <Navbar>
    <USelect v-model="attrs.size" :items="sizes" multiple size="xs" placeholder="size" />
    <USelect v-model="attrs.color" :items="colors" multiple size="xs" placeholder="color" />
  </Navbar>

  <div class="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Showcase title="基础用法" description="传入 items 渲染层级结构，节点 defaultExpanded 控制初始展开，v-model 绑定单选节点。" :state="{ selected: basicValue?.label }">
      <MTree v-model="basicValue" :items="fileTree" />
    </Showcase>

    <Showcase title="搜索过滤" description="searchable 开启搜索框，按关键字剪枝并保留祖先链，highlight 高亮命中文本，命中后自动展开。">
      <MTree :items="fileTree" searchable />
    </Showcase>

    <Showcase title="复选框级联" description="checkable 渲染复选框并启用 multiple、父子级联与半选，v-model 收集选中节点数组。" :state="{ checked: checkedValue.map(n => n.label) }">
      <MTree v-model="checkedValue" :items="fileTree" checkable />
    </Showcase>

    <Showcase title="工具栏操作" description="toolbar 提供展开/折叠全部按钮，checkable 时附带全选、清空，并内嵌搜索框。" :state="{ checked: toolbarChecked.map(n => n.label) }">
      <MTree v-model="toolbarChecked" :items="fileTree" toolbar searchable checkable />
    </Showcase>

    <Showcase title="异步懒加载" description="lazy 配合 loadChildren，展开未加载的父节点时拉取子节点并显示加载态，isLeaf 标记不可展开。">
      <MTree :items="lazyTree" lazy :load-children="loadChildren" />
    </Showcase>

    <Showcase title="自定义字段" description="childrenKey 映射后端的子节点字段，labelKey 指定展示字段，无需预先改造数据结构。" :state="{ selected: deptValue }">
      <MTree v-model="deptValue" :items="deptTree" children-key="nodes" label-key="name" />
    </Showcase>

    <Showcase title="虚拟滚动" description="virtualize 透传 UTree 虚拟化，仅渲染可视区节点，适配大数据量树。">
      <MTree :items="bigTree" :virtualize="true" class="max-h-72" />
    </Showcase>

    <Showcase title="自定义节点" description="通过 item-trailing 插槽为节点追加徽章等内容，未覆盖的插槽仍由 UTree 默认渲染。">
      <MTree :items="fileTree">
        <template #item-trailing="{ item }">
          <UBadge v-if="!item.children" label="file" color="neutral" variant="subtle" size="sm" />
        </template>
      </MTree>
    </Showcase>
  </div>

  <Matrix v-slot="props" :attrs="attrs">
    <MTree v-model="matrixValue" :items="fileTree" :size="props.size" :color="props.color" />
  </Matrix>
</template>
