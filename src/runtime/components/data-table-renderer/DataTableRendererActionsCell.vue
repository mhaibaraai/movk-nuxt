<script lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import type { CellContext } from '@tanstack/vue-table'
import type {
  DataTableAction,
  DataTableActionButtonContext,
  DataTableActionsColumn,
  DataTableDynamic,
  DataTableProps
} from '../../types/data-table'

interface DataTableRendererActionsCellProps {
  col: DataTableActionsColumn<unknown>
  cellCtx: CellContext<unknown, unknown>
  options: DataTableProps<any>
}
</script>

<script lang="ts" setup>
import { h } from 'vue'
import { isFunction } from '@movk/core'
import { resolveCallbackValue } from '../../domains/data-table/state/models'
import { useMessageBox } from '../../composables/useMessageBox'
import { UButton, UDropdownMenu } from '#components'
import DataTableActionConfirm from './DataTableRendererActionConfirm.vue'

const props = defineProps<DataTableRendererActionsCellProps>()

const { confirm } = useMessageBox()

function buildActionCtx(action: DataTableAction<unknown>): DataTableActionButtonContext<unknown> {
  return {
    cellContext: props.cellCtx,
    row: props.cellCtx.row.original,
    index: props.cellCtx.row.index,
    action
  }
}

function renderInline(action: DataTableAction<unknown>, idx: number) {
  const actionCtx = buildActionCtx(action)
  return h(DataTableActionConfirm, {
    key: action.key ?? `${idx}`,
    action,
    ctx: actionCtx,
    globalButtonProps: props.options.actionButtonProps as DataTableDynamic<ButtonProps, DataTableActionButtonContext<unknown>> | undefined
  })
}

function renderOverflow(actions: DataTableAction<unknown>[]) {
  const groups: Record<string, unknown>[][] = []
  let currentGroup: Record<string, unknown>[] = []

  for (const action of actions) {
    if (action.divider && currentGroup.length > 0) {
      groups.push(currentGroup)
      currentGroup = []
    }
    const actionCtx = buildActionCtx(action)
    const resolved = resolveCallbackValue(action.buttonProps ?? {}, actionCtx) as ButtonProps
    const isDisabled = resolveCallbackValue(action.disabled ?? false, actionCtx)

    currentGroup.push({
      label: resolved.label ?? '',
      icon: resolved.icon,
      color: resolved.color,
      disabled: isDisabled,
      onSelect: async (e: Event) => {
        e.stopPropagation()
        if (action.confirm) {
          const ok = await confirm(resolveCallbackValue(action.confirmProps ?? {}, actionCtx))
          if (!ok) return
        }
        await action.onClick(actionCtx)
      }
    })
  }
  if (currentGroup.length > 0) groups.push(currentGroup)

  const triggerProps = {
    variant: 'ghost' as const,
    size: 'xs' as const,
    color: 'neutral' as const,
    icon: 'i-lucide-ellipsis',
    ...resolveCallbackValue(props.options.actionsOverflowTrigger ?? {}, props.cellCtx),
    ...resolveCallbackValue(props.col.overflowTrigger ?? {}, props.cellCtx)
  }
  const dropdownProps = resolveCallbackValue(props.col.dropdownProps ?? {}, props.cellCtx)

  return h(UDropdownMenu, { ...dropdownProps, items: groups }, {
    default: () => h(UButton, { ...triggerProps, onClick: (e: Event) => e.stopPropagation() })
  })
}

function render() {
  const actionList: DataTableAction<unknown>[] = isFunction(props.col.actions)
    ? props.col.actions(props.cellCtx)
    : props.col.actions

  const visible = actionList.filter(a =>
    resolveCallbackValue(a.visibility ?? true, buildActionCtx(a))
  )

  if (visible.length === 0) return null

  const maxInline = props.col.maxInline ?? props.options.actionsMaxInline ?? 3
  const shouldOverflow = visible.length > maxInline
  const inline = shouldOverflow ? visible.slice(0, maxInline - 1) : visible
  const overflow = shouldOverflow ? visible.slice(maxInline - 1) : []

  const wrapperClass = isFunction(props.col.wrapperClass)
    ? props.col.wrapperClass(props.cellCtx)
    : (props.col.wrapperClass ?? 'flex items-center gap-1')

  return h('div', { class: wrapperClass }, [
    ...inline.map((action, idx) => renderInline(action, idx)),
    overflow.length > 0 ? renderOverflow(overflow) : null
  ])
}
</script>

<template>
  <render />
</template>
