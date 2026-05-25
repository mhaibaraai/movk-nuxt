<script setup lang="ts">
import json5 from 'json5'
import { camelCase } from 'scule'
import { hash } from 'ohash'
import * as theme from '#build/movk-ui'

const props = defineProps<{
  slug?: string
  extra?: string[]
}>()

const route = useRoute()

const name = props.slug ?? route.path.split('/').pop() ?? ''
const camelName = camelCase(name)

const strippedCompoundVariants = ref(false)

const strippedTheme = computed(() => {
  const strippedTheme = {
    ...(theme as any)[camelName]
  }

  if (strippedTheme?.compoundVariants) {
    strippedTheme.compoundVariants = strippedTheme.compoundVariants.filter((compoundVariant: any) => {
      if (compoundVariant.color) {
        if (!['primary', 'neutral'].includes(compoundVariant.color)) {
          strippedCompoundVariants.value = true

          return false
        }
      }

      if (compoundVariant.highlightColor) {
        if (!['primary', 'neutral'].includes(compoundVariant.highlightColor)) {
          strippedCompoundVariants.value = true

          return false
        }
      }

      if (compoundVariant.loadingColor) {
        if (!['primary', 'neutral'].includes(compoundVariant.loadingColor)) {
          strippedCompoundVariants.value = true

          return false
        }
      }

      return true
    })
  }

  return strippedTheme
})

const component = computed(() => {
  const content: Record<string, any> = { [camelName]: strippedTheme.value }

  if (props.extra?.length) {
    props.extra.forEach((extra) => {
      content[extra] = (theme as any)[extra]
    })
  }

  return {
    ui: content
  }
})

const themeLink = computed(() =>
  `https://github.com/mhaibaraai/movk-nuxt/blob/main/src/theme/${name}.ts`
)

const { data: ast } = useAsyncData(`component-theme-${camelName}-${hash({ props })}`, async () => {
  const md = `
::code-collapse

\`\`\`ts [app.config.ts]
export default defineAppConfig(${json5.stringify(component.value, null, 2).replace(/,([ |\t\n]+[}|\])])/g, '$1')})
\`\`\`

::

${strippedCompoundVariants.value
  ? `
::callout{icon="i-simple-icons-github" to="${themeLink.value}" title="Compound variants"}
Some colors in \`compoundVariants\` are omitted for readability. Check out the source code on GitHub.
::`
  : ''}
`

  return cachedParseMarkdown(md)
}, { lazy: import.meta.client })
</script>

<template>
  <MDCRenderer v-if="ast" :body="ast.body" :data="ast.data" />
</template>
