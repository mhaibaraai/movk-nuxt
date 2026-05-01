export default () => ({
  slots: {
    base: '',
    tbody: 'divide-y-0'
  },
  variants: {
    fitContent: {
      true: {
        base: 'w-fit min-w-0'
      }
    }
  }
})
