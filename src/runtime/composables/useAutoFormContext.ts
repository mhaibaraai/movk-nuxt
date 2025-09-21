import type { InjectionKey, ModelRef } from 'vue'
import type { AutoFormField, AutoFormFieldContext } from '../types/auto-form'
import { computed, inject, provide } from 'vue'
import { getPath, setPath } from '../core'

// 字段上下文工厂类型
export interface AutoFormContextFactory {
  createFieldContext: (field: AutoFormField) => AutoFormFieldContext
  slots: Record<string, any> // 插槽引用
}

// 注入键
export const AUTO_FORM_CONTEXT_KEY: InjectionKey<AutoFormContextFactory> = Symbol('AutoFormContext')

/**
 * 提供字段上下文管理的 composable（用于 AutoForm 组件）
 */
export function useAutoFormProvider<T extends Record<string, any>>(
  state: ModelRef<T, string, T, T>,
  slots: Record<string, any>,
) {
  // 创建字段上下文工厂 - 使用 Vue 3 响应式系统，避免手动缓存
  const contextFactory: AutoFormContextFactory = {
    createFieldContext(field: AutoFormField): AutoFormFieldContext {
      const path = field.path
      return {
        get state() { return state.value as T },
        path,
        value: computed(() => getPath(state.value, path)),
        setValue: (v: any) => setPath(state.value, path, v),
      }
    },
    slots, // 提供插槽访问
  }

  // 提供上下文工厂
  provide(AUTO_FORM_CONTEXT_KEY, contextFactory)

  return {
    contextFactory,
  }
}

/**
 * 注入字段上下文管理的 composable（用于子组件）
 */
export function useAutoFormInjector() {
  const contextFactory = inject(AUTO_FORM_CONTEXT_KEY)

  if (!contextFactory) {
    throw new Error('[AutoForm] useAutoFormInjector must be used within AutoForm component')
  }

  return contextFactory
}
