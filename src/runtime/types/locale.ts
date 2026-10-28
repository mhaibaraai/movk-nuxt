export interface MovkMessages {
  autoForm: {
    submit: string
    add: string
    moveUp: string
    moveDown: string
    duplicate: string
    remove: string
  }
  searchForm: {
    search: string
    reset: string
    expand: string
    collapse: string
  }
  dataTable: {
    actions: string
    selectAll: string
    selectRow: string
    selectParentRow: string
    expandAll: string
    collapseAll: string
    pinRow: string
    unpinRow: string
    pinColumn: string
    unpinColumn: string
  }
  pagination: {
    empty: string
    total: string
    range: string
    rangeUnknown: string
    selected: string
    pageSize: string
  }
  tree: {
    empty: string
    loading: string
    selected: string
    selectAll: string
    expandAll: string
    collapseAll: string
    search: string
    clearSearch: string
  }
  datePicker: {
    placeholder: string
    today: string
    yesterday: string
    tomorrow: string
    thisWeek: string
    thisMonth: string
    last7Days: string
    last30Days: string
  }
  messageBox: {
    title: string
    acknowledge: string
    confirm: string
    cancel: string
  }
  validation: {
    required: string
    requiredWithLabel: string
  }
}

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] }

/** 以点号连接的文案路径，如 `'messageBox.confirm'` */
export type MovkMessageKey = {
  [G in keyof MovkMessages]: `${G & string}.${keyof MovkMessages[G] & string}`
}[keyof MovkMessages]

export type MovkLocaleMessages = DeepPartial<MovkMessages>
