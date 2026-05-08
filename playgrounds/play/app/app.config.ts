export default defineAppConfig({
  ui: {
    colors: {
      primary: 'sky',
      neutral: 'slate'
    }
  },
  toaster: {
    position: 'top-center' as const,
    duration: 3000
  }
})
