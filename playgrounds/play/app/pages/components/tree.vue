<script setup lang="ts">
import type { SemanticColor, SemanticSize, TreeExposed, TreeItem } from '@movk/nuxt'

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
const multipleValue = ref<TreeItem[]>([])
const checkedValue = ref<TreeItem[]>([])
const toolbarChecked = ref<TreeItem[]>([])
const slotChecked = ref<TreeItem[]>([])
const changeKeys = ref<string[]>([])
const cascadeChecked = ref<TreeItem[]>([])
const isolatedChecked = ref<TreeItem[]>([])
const keysSelected = ref<string[]>(['useAuth.ts'])

const selData = useTemplateRef<TreeExposed>('selData')
const selectionLeaves = computed(() => (selData.value?.treeSelection.leaves ?? []).map(n => String(n.label)))
const selectionParents = computed(() => (selData.value?.treeSelection.parents ?? []).map(n => String(n.label)))
const selectionHalf = computed(() => (selData.value?.treeSelection.halfSelected ?? []).map(n => String(n.label)))
const selectionChecked = ref<TreeItem[]>([])

const apiTree = useTemplateRef<TreeExposed>('apiTree')
const apiChecked = ref<TreeItem[]>([])

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
      <MTree v-model="basicValue" :items="fileTree" class="max-h-50" />
    </Showcase>

    <Showcase title="默认展开" description="defaultExpanded 传 number 仅展开浅于该层的父级，传 true 展开全部，传函数按节点与深度自定义，缺省回退节点 defaultExpanded 标记。">
      <MTree :items="fileTree" :default-expanded="1" />
    </Showcase>

    <Showcase title="搜索过滤" description="searchable 开启搜索框，按关键字剪枝并保留祖先链，highlight 高亮命中文本，命中后自动展开。">
      <MTree :items="fileTree" searchable />
    </Showcase>

    <Showcase title="复选框级联" description="checkable 渲染复选框并启用 multiple、父子级联与半选，v-model 收集选中节点数组。" :state="{ checked: checkedValue.map(n => n.label) }">
      <MTree v-model="checkedValue" :items="fileTree" checkable />
    </Showcase>

    <Showcase title="多选模式" description="multiple 开启多选但不渲染复选框，点击节点累加选中，v-model 收集选中节点数组。" :state="{ selected: multipleValue.map(n => n.label) }">
      <MTree v-model="multipleValue" :items="fileTree" multiple />
    </Showcase>

    <Showcase title="父子策略" description="strategy 控制父子勾选关系，cascade 级联且全选回填、isolated 互不关联，左右对照同一棵树。" :state="{ cascade: cascadeChecked.map(n => n.label), isolated: isolatedChecked.map(n => n.label) }">
      <div class="grid grid-cols-2 gap-4">
        <MTree v-model="cascadeChecked" :items="fileTree" checkable />
        <MTree v-model="isolatedChecked" :items="fileTree" checkable strategy="isolated" />
      </div>
    </Showcase>

    <Showcase title="键绑定" description="v-model:selectedKeys 以 key 数组双向绑定选中，key 由 getKey/labelKey 派生，与 v-model 互通。" :state="{ keys: keysSelected }">
      <MTree
        v-model:selected-keys="keysSelected"
        :items="fileTree"
        checkable
        :default-expanded="true"
      />
    </Showcase>

    <Showcase title="工具栏操作" description="toolbar 提供展开/折叠切换按钮，checkable 时附带三态全选复选框与选中计数，并内嵌可清除的搜索框。" :state="{ checked: toolbarChecked.map(n => n.label) }">
      <MTree v-model="toolbarChecked" :items="fileTree" toolbar searchable checkable />
    </Showcase>

    <Showcase title="工具栏插槽" description="toolbar-leading、toolbar-trailing 在默认工具栏首尾追加内容，change 事件回传选中值、节点 key 与选中分类。" :state="{ keys: changeKeys }">
      <MTree v-model="slotChecked" :items="fileTree" toolbar checkable @change="changeKeys = $event.keys">
        <template #toolbar-leading>
          <UBadge label="文件" color="neutral" variant="subtle" size="sm" />
        </template>
        <template #toolbar-trailing>
          <UBadge :label="`${slotChecked.length} 项`" color="primary" variant="subtle" size="sm" />
        </template>
      </MTree>
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

    <Showcase title="命令式控制" description="通过模板 ref 调用 expandToDepth、collapseAll、selectAll、clearSelection 等暴露方法控制树。" :state="{ checked: apiChecked.map(n => n.label) }">
      <div class="flex flex-col gap-2">
        <div class="flex flex-wrap gap-2">
          <UButton size="xs" label="展开到第 2 层" @click="apiTree?.expandToDepth(2)" />
          <UButton size="xs" label="收起全部" color="neutral" variant="subtle" @click="apiTree?.collapseAll()" />
          <UButton size="xs" label="全选" @click="apiTree?.selectAll()" />
          <UButton size="xs" label="清空" color="neutral" variant="subtle" @click="apiTree?.clearSelection()" />
        </div>
        <MTree ref="apiTree" v-model="apiChecked" :items="fileTree" checkable />
      </div>
    </Showcase>

    <Showcase title="选中分类" description="实例 treeSelection 反应式回传 leaves、parents、halfSelected、strictlyChecked 等选中分类。" :state="{ leaves: selectionLeaves, parents: selectionParents, half: selectionHalf }">
      <MTree
        ref="selData"
        v-model="selectionChecked"
        :items="fileTree"
        checkable
        :default-expanded="true"
      />
    </Showcase>
  </div>

  <Matrix v-slot="props" :attrs="attrs">
    <MTree v-model="matrixValue" :items="fileTree" :size="props.size" :color="props.color" />
  </Matrix>
</template>
