// @ts-check
import antfu from '@antfu/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

// https://eslint.nuxt.com/packages/module#custom-config-presets
export default withNuxt(
  antfu({
    pnpm: true,
    formatters: true,
  }),
  {
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.vue'],
    rules: {
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: 5,
        },
      ],
    },
  },
)
