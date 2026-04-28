export default () => ({
  slots: {
    base: '',
    leading: '',
    dialCode: ''
  },
  variants: {
    dialCode: {
      true: {
        base: 'ps-(--dial-code-length)',
        leading: 'pointer-events-none text-muted'
      }
    }
  }
})
