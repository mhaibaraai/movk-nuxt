export default defineAppConfig({
  movk: {
    picker: {
    },
    asPhoneNumberInput: {
      variants: {
        dialCode: {
          true: { leading: 'text-amber-100' }
        }
      }
    }
  },
  toaster: {
    position: 'top-center' as const,
    duration: 3000
  }
})
