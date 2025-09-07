import type { ComponentProps, ComponentSlots, IsComponent } from '../core'

export interface AutoFormControl<C extends IsComponent> {
  component: C
  props?: ComponentProps<C>
  slots?: ComponentSlots<C>
}

export type AutoFormControls = Record<string, AutoFormControl<IsComponent>>
