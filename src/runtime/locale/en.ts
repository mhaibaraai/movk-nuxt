import type { MovkMessages } from '../types/locale'

export default {
  autoForm: {
    submit: 'Submit',
    add: 'Add',
    moveUp: 'Move up',
    moveDown: 'Move down',
    duplicate: 'Duplicate',
    remove: 'Remove'
  },
  searchForm: {
    search: 'Search',
    reset: 'Reset',
    expand: 'Expand',
    collapse: 'Collapse'
  },
  dataTable: {
    actions: 'Actions',
    selectAll: 'Select all rows',
    selectRow: 'Select row',
    selectParentRow: 'Select parent row',
    expandAll: 'Expand all rows',
    collapseAll: 'Collapse all rows',
    pinRow: 'Pin row',
    unpinRow: 'Unpin row',
    pinColumn: 'Pin column',
    unpinColumn: 'Unpin column',
    columnSettings: 'Columns',
    resetColumns: 'Reset columns'
  },
  pagination: {
    empty: 'Showing 0',
    total: '{total} items',
    range: 'Showing {from}-{to} of {total}',
    rangeUnknown: 'Showing {from}-{to}, page {page} of {pageCount}',
    selected: '{count} selected',
    pageSize: '{size} / page'
  },
  tree: {
    empty: 'No results',
    loading: 'Loading',
    selected: '{count} selected',
    selectAll: 'Select all',
    expandAll: 'Expand all',
    collapseAll: 'Collapse all',
    search: 'Search nodes',
    clearSearch: 'Clear search'
  },
  datePicker: {
    placeholder: 'Select date',
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This week',
    thisMonth: 'This month',
    last7Days: 'Last 7 days',
    last30Days: 'Last 30 days'
  },
  messageBox: {
    title: 'Notice',
    acknowledge: 'OK',
    confirm: 'Confirm',
    cancel: 'Cancel'
  },
  validation: {
    required: 'This field is required',
    requiredWithLabel: '{label} is required'
  }
} satisfies MovkMessages
