import type { MovkMessages } from '../types/locale'

export default {
  autoForm: {
    submit: '提交',
    add: '添加',
    moveUp: '上移',
    moveDown: '下移',
    duplicate: '复制',
    remove: '删除'
  },
  searchForm: {
    search: '搜索',
    reset: '重置',
    expand: '展开',
    collapse: '收起'
  },
  dataTable: {
    actions: '操作',
    selectAll: '全选',
    selectRow: '选择行',
    selectParentRow: '选择父行',
    expandAll: '展开全部',
    collapseAll: '折叠全部',
    pinRow: '固定行',
    unpinRow: '取消固定行',
    pinColumn: '固定列',
    unpinColumn: '取消固定列',
    columnSettings: '列设置',
    resetColumns: '重置列'
  },
  pagination: {
    empty: '显示 0',
    total: '共 {total} 条',
    range: '显示 {from}-{to}，共 {total} 条',
    rangeUnknown: '显示 {from}-{to}，第 {page} / {pageCount} 页',
    selected: '已选 {count} 条',
    pageSize: '{size} 条/页'
  },
  tree: {
    empty: '无匹配结果',
    loading: '加载中',
    selected: '已选 {count}',
    selectAll: '全选',
    expandAll: '展开全部',
    collapseAll: '折叠全部',
    search: '搜索节点',
    clearSearch: '清除搜索'
  },
  datePicker: {
    placeholder: '选择日期',
    today: '今天',
    yesterday: '昨天',
    tomorrow: '明天',
    thisWeek: '本周',
    thisMonth: '本月',
    last7Days: '最近 7 天',
    last30Days: '最近 30 天'
  },
  messageBox: {
    title: '提示',
    acknowledge: '知道了',
    confirm: '确认',
    cancel: '取消'
  },
  validation: {
    required: '此项为必填',
    requiredWithLabel: '{label}为必填'
  }
} satisfies MovkMessages
