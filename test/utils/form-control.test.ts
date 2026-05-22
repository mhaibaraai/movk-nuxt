// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { computed, createApp, defineComponent, h, provide } from 'vue'
import { useEventBus } from '@vueuse/core'
import {
  formBusInjectionKey,
  formFieldInjectionKey
} from '@nuxt/ui/composables/useFormField'
import { fieldGroupInjectionKey } from '@nuxt/ui/composables/useFieldGroup'
import { omitProps, useFormFieldBridge } from '../../src/runtime/utils/form-control'

type AnyComponent = ReturnType<typeof defineComponent>

function harness<R>(setup: () => R, providers: AnyComponent[] = []): R {
  const captured: { result?: R } = {}
  const Inner = defineComponent({
    setup() {
      captured.result = setup()
      return () => null
    }
  })

  const Root = defineComponent({
    setup: () => () => providers.reduceRight<unknown>(
      (acc, Wrapper) => h(Wrapper, () => acc),
      h(Inner)
    ) as never
  })

  const app = createApp(Root)
  const host = document.createElement('div')
  app.mount(host)
  app.unmount()
  return captured.result as R
}

function provideFormField(name = 'email', size: string | undefined = 'md', eagerValidation = false) {
  return defineComponent({
    setup(_, { slots }) {
      provide(formFieldInjectionKey, computed(() => ({
        id: 'form-field-id',
        ariaId: 'aria-id',
        name,
        size: size as never,
        color: undefined,
        disabled: undefined,
        highlight: false,
        ariaDescribedby: undefined,
        eagerValidation,
        errorPattern: undefined
      })))
      return () => slots.default?.()
    }
  })
}

function provideFieldGroup(size: string | undefined = 'lg') {
  return defineComponent({
    setup(_, { slots }) {
      provide(fieldGroupInjectionKey, computed(() => ({
        size: size as never,
        orientation: 'horizontal' as const
      })))
      return () => slots.default?.()
    }
  })
}

function provideFormBus() {
  const bus = useEventBus<never>('test-form-bus')
  const events: unknown[] = []
  bus.on(event => events.push(event))
  const Provider = defineComponent({
    setup(_, { slots }) {
      provide(formBusInjectionKey, bus as never)
      return () => slots.default?.()
    }
  })
  return { Provider, events }
}

describe('omitProps', () => {
  it('omits wrapper private props and keeps input field props', () => {
    const forwarded = omitProps({
      id: 'name-input',
      name: 'name',
      size: 'xs',
      disabled: true,
      highlight: true,
      placeholder: 'Name',
      buttonProps: { icon: 'i-lucide-x' },
      ui: { base: 'rounded-none' }
    }, ['buttonProps', 'ui'])

    expect(forwarded).toEqual({
      id: 'name-input',
      name: 'name',
      size: 'xs',
      disabled: true,
      highlight: true,
      placeholder: 'Name'
    })
  })

  it('filters out keys whose value is undefined', () => {
    const forwarded = omitProps({ a: 1, b: undefined, c: 'x' }, [])
    expect(forwarded).toEqual({ a: 1, c: 'x' })
  })
})

describe('useFormFieldBridge', () => {
  it('returns undefined size when there is no injection or props', () => {
    const bridge = harness(() => useFormFieldBridge())
    expect(bridge.size.value).toBeUndefined()
  })

  it('falls back to UFormField size when props and fieldGroup are missing', () => {
    const bridge = harness(() => useFormFieldBridge(), [provideFormField('a', 'md')])
    expect(bridge.size.value).toBe('md')
  })

  it('prefers UFieldGroup size over UFormField size', () => {
    const bridge = harness(
      () => useFormFieldBridge(),
      [provideFormField('a', 'md'), provideFieldGroup('lg')]
    )
    expect(bridge.size.value).toBe('lg')
  })

  it('prefers explicit props.size over any injected size', () => {
    const bridge = harness(
      () => useFormFieldBridge({ size: 'xs' }),
      [provideFormField('a', 'md'), provideFieldGroup('lg')]
    )
    expect(bridge.size.value).toBe('xs')
  })

  it('emit helpers no-op when there is no form bus', () => {
    const bridge = harness(() => useFormFieldBridge(), [provideFormField('a')])
    expect(() => {
      bridge.emitFormInput()
      bridge.emitFormChange()
      bridge.emitFormBlur()
      bridge.emitFormFocus()
    }).not.toThrow()
  })

  it('emits events with field name and attaches eager only on input', () => {
    const { Provider, events } = provideFormBus()
    const bridge = harness(
      () => useFormFieldBridge(),
      [Provider, provideFormField('email', 'md', true)]
    )

    bridge.emitFormInput()
    bridge.emitFormChange()
    bridge.emitFormBlur()
    bridge.emitFormFocus()

    expect(events).toEqual([
      { type: 'input', name: 'email', eager: true },
      { type: 'change', name: 'email' },
      { type: 'blur', name: 'email' },
      { type: 'focus', name: 'email' }
    ])
  })

  it('does not emit when field name is missing', () => {
    const { Provider, events } = provideFormBus()
    const bridge = harness(
      () => useFormFieldBridge(),
      [Provider, provideFormField('', 'md')]
    )
    bridge.emitFormInput()
    bridge.emitFormChange()
    expect(events).toEqual([])
  })
})
