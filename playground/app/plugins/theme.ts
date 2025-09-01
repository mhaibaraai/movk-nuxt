import { defineNuxtPlugin, useAppConfig, useHead } from '#imports'

export default defineNuxtPlugin({
  enforce: 'post',
  setup() {
    const { ui, theme } = useAppConfig()
    const storageKey = `${theme.prefix}:${theme.key}`

    if (import.meta.client) {
      const storage = JSON.parse(localStorage.getItem(`${storageKey}`) || '{}')
      function updateColor(type: 'primary' | 'neutral') {
        const color = storage.ui?.colors?.[type]
        if (color) {
          ui.colors[type] = color
        }
      }

      function updateRadius() {
        const radius = storage.theme?.radius
        if (radius) {
          theme.radius = Number.parseFloat(radius)
        }
      }

      function updateBlackAsPrimary() {
        const blackAsPrimary = storage.theme?.blackAsPrimary
        if (blackAsPrimary) {
          theme.blackAsPrimary = blackAsPrimary === 'true'
        }
      }

      updateColor('primary')
      updateColor('neutral')
      updateRadius()
      updateBlackAsPrimary()
    }

    if (import.meta.server) {
      useHead({
        script: [{
          innerHTML: `
            const storage = JSON.parse(localStorage.getItem('${storageKey}') || '{}');
            let html = document.querySelector('style#nuxt-ui-colors').innerHTML;
            if (storage.ui?.colors?.primary) {
              const primaryColor = storage.ui.colors.primary;
              if (primaryColor !== 'black') {
                html = html.replace(
                  /(--ui-color-primary-\\d{2,3}:\\s*var\\(--color-)${ui.colors.primary}(-\\d{2,3}.*?\\))/g,
                  \`$1\${primaryColor}$2\`
                );
              }
            }
            if (storage.ui?.colors?.neutral) {
              let neutralColor = storage.ui.colors.neutral;
              html = html.replace(
                /(--ui-color-neutral-\\d{2,3}:\\s*var\\(--color-)${ui.colors.neutral}(-\\d{2,3}.*?\\))/g,
                \`$1\${neutralColor === 'neutral' ? 'old-neutral' : neutralColor}$2\`
              );
            }

            document.querySelector('style#nuxt-ui-colors').innerHTML = html;
            `.replace(/\s+/g, ' '),
          type: 'text/javascript',
          tagPriority: -1,
        }, {
          innerHTML: `
            if (storage.theme?.radius) {
              document.querySelector('style#nuxt-ui-radius').innerHTML = ':root { --ui-radius: ' + storage.theme.radius + 'rem; }';
            }
          `.replace(/\s+/g, ' '),
          type: 'text/javascript',
          tagPriority: -1,
        }, {
          innerHTML: `
            if (storage.theme?.blackAsPrimary === 'true') {
              document.querySelector('style#nuxt-ui-black-as-primary').innerHTML = ':root { --ui-primary: black; } .dark { --ui-primary: white; }';
            } else {
              document.querySelector('style#nuxt-ui-black-as-primary').innerHTML = '';
            }
          `.replace(/\s+/g, ' '),
        }],
      })
    }
  },
})
