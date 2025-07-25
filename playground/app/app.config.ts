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
  },
  theme: {
    radius: 0.25,
    blackAsPrimary: false,
  },
})
