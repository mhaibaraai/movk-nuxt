import { kebabCase } from '@movk/core'
import { defineNuxtPlugin, useAppConfig, useHead, useSiteConfig } from '#imports'
import { resolveThemeIcons } from '../domains/theme/theme-icons'
import { resolveFontHrefMap, type ThemeFontOption } from '../domains/theme/theme-font'

export default defineNuxtPlugin({
  enforce: 'post',
  setup() {
    const appConfig = useAppConfig()
    const site = useSiteConfig()
    const name = kebabCase(site.name)

    if (import.meta.client) {
      const primary = localStorage.getItem(`${name}-ui-primary`)
      if (primary) appConfig.ui.colors.primary = primary

      const neutral = localStorage.getItem(`${name}-ui-neutral`)
      if (neutral) appConfig.ui.colors.neutral = neutral

      const icons = localStorage.getItem(`${name}-ui-icons`)
      if (icons) appConfig.ui.icons = resolveThemeIcons(icons, appConfig.ui.icons) as any
    }

    if (import.meta.server) {
      const pickerFonts = (appConfig.movk?.picker?.fonts ?? []) as ThemeFontOption[]
      const fontHrefMapJson = JSON.stringify(resolveFontHrefMap(pickerFonts))

      useHead({
        script: [{
          innerHTML: `
            (function() {
              var primaryColor = localStorage.getItem('${name}-ui-primary');
              var neutralColor = localStorage.getItem('${name}-ui-neutral');
              if (!primaryColor && !neutralColor) return;
              function swapColors(el) {
                var html = el.innerHTML;
                if (primaryColor && primaryColor !== 'black') {
                  html = html.replace(
                    /(--ui-color-primary-\\d{2,3}:\\s*var\\(--color-)${appConfig.ui.colors.primary}(-\\d{2,3}.*?\\))/g,
                    \`$1\${primaryColor}$2\`
                  );
                }
                if (neutralColor) {
                  html = html.replace(
                    /(--ui-color-neutral-\\d{2,3}:\\s*var\\(--color-)${appConfig.ui.colors.neutral}(-\\d{2,3}.*?\\))/g,
                    \`$1\${neutralColor === 'neutral' ? 'old-neutral' : neutralColor}$2\`
                  );
                }
                el.innerHTML = html;
              }
              var colorsEl = document.querySelector('style#nuxt-ui-colors');
              if (colorsEl) {
                swapColors(colorsEl);
              } else {
                var obs = new MutationObserver(function(mutations) {
                  for (var i = 0; i < mutations.length; i++) {
                    for (var j = 0; j < mutations[i].addedNodes.length; j++) {
                      var node = mutations[i].addedNodes[j];
                      if (node.id === 'nuxt-ui-colors') {
                        swapColors(node);
                        obs.disconnect();
                        return;
                      }
                    }
                  }
                });
                obs.observe(document.head, { childList: true });
              }
            })();
            `.replace(/\s+/g, ' '),
          type: 'text/javascript',
          tagPriority: -1
        }, {
          innerHTML: `
            var r = parseFloat(localStorage.getItem('${name}-ui-radius'));
            if (isFinite(r)) document.documentElement.style.setProperty('--ui-radius', r + 'rem');
          `.replace(/\s+/g, ' '),
          type: 'text/javascript',
          tagPriority: -1
        }, {
          innerHTML: `
            if (localStorage.getItem('${name}-ui-black-as-primary') === 'true') {
              var isDark = document.documentElement.classList.contains('dark');
              document.documentElement.style.setProperty('--ui-primary', isDark ? 'white' : 'black');
            }
          `.replace(/\s+/g, ' ')
        }, {
          innerHTML: [
            `var font = localStorage.getItem('${name}-ui-font');`,
            `if (font) {`,
            `var fontEl = document.querySelector('style#nuxt-ui-font');`,
            // textContent 而非 innerHTML：字体名来自 localStorage，避免被当作标记解析
            `if (fontEl) { fontEl.textContent = ':root { --font-sans: ' + JSON.stringify(font) + ', sans-serif; }'; }`,
            `var fontMap = ${fontHrefMapJson};`,
            `var href = fontMap[font];`,
            `var id = 'font-' + font.toLowerCase().replace(/\\s+/g, '-');`,
            // 未登记的字体不猜测来源；已由 SSR 输出的 link 不重复插入
            `if (href && !document.getElementById(id)) {`,
            `var lnk = document.createElement('link');`,
            `lnk.rel = 'stylesheet';`,
            `lnk.href = href;`,
            `lnk.id = id;`,
            `document.head.appendChild(lnk);`,
            `}`,
            `}`
          ].join(' ')
        }]
      })
    }
  }
})
