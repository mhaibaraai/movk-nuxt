import type { ComponentProps, IsComponent } from '../../core'
import UInput from '@nuxt/ui/components/Input.vue'
import UInputNumber from '@nuxt/ui/components/InputNumber.vue'
import USelect from '@nuxt/ui/components/Select.vue'
import USwitch from '@nuxt/ui/components/Switch.vue'

export interface Control<C> {
  component: C
  defaults?: ComponentProps<C>
}

export type Controls = Record<string, Control<IsComponent>>

export const defaultControls = {
  string: { component: UInput, defaults: { size: 'sm' } },
  number: { component: UInputNumber },
  boolean: { component: USwitch },
  enum: { component: USelect },
} satisfies Controls
