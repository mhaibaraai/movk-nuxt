import { vi } from 'vitest'

// Mock all UI components used in useAutoForm
const createMockComponent = (name: string) => ({
  name,
  setup: vi.fn(),
  render: vi.fn()
})

export const UInput = createMockComponent('UInput')
export const UInputNumber = createMockComponent('UInputNumber')
export const UCheckbox = createMockComponent('UCheckbox')
export const USwitch = createMockComponent('USwitch')
export const UTextarea = createMockComponent('UTextarea')
export const USlider = createMockComponent('USlider')
export const UPinInput = createMockComponent('UPinInput')
export const UInputTags = createMockComponent('UInputTags')
export const UFileUpload = createMockComponent('UFileUpload')
export const USelect = createMockComponent('USelect')
export const USelectMenu = createMockComponent('USelectMenu')
export const UInputMenu = createMockComponent('UInputMenu')
export const UCheckboxGroup = createMockComponent('UCheckboxGroup')
export const URadioGroup = createMockComponent('URadioGroup')
export const UInputDate = createMockComponent('UInputDate')
export const UInputTime = createMockComponent('UInputTime')
