export default defineAppConfig({
  toaster: {
    position: 'top-center' as const,
    duration: 3000,
  },
  ui: {
    colors: {
      primary: 'sky',
      neutral: 'zinc',
    },
    collapsible: {
      slots: {
        content: 'space-y-4',
      },
    },
    form: {
      base: 'space-y-4',
    },
  },
  theme: {
    prefix: 'movk',
    key: 'admin-theme',
    radius: 0.25,
    blackAsPrimary: false,
  },
})
