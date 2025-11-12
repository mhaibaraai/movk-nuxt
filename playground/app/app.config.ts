export default defineAppConfig({
  toaster: {
    position: 'top-center' as const,
    duration: 5000,
    max: 5,
    expand: true,
    disableSwipe: false
  },
  ui: {
    colors: {
      primary: 'sky',
      neutral: 'zinc'
    },
    collapsible: {
      slots: {
        content: 'space-y-4'
      }
    },
    form: {
      base: 'space-y-4 min-w-md'
    }
  }
})
