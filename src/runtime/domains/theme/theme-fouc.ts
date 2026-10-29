function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 匹配 `--ui-color-<key>-500: var(--[prefix-]color-<任意色名>-500` 中的色名段 */
function shadePattern(key: 'primary' | 'neutral', prefix?: string): string {
  const varPrefix = prefix ? escapeRegExp(`${prefix}-`) : ''
  return `(--ui-color-${key}-\\d{2,3}:\\s*var\\(--${varPrefix}color-)[a-z-]+?(-\\d{2,3}\\s*[,)])`
}

/**
 * 首屏前按 localStorage 改写 `style#nuxt-ui-colors` 中的色板引用，避免切换过的主色/中性色闪烁。
 * 色名段按通配匹配，不依赖构建期配置色，兼容 `theme.prefix` 与 `neutral → old-neutral` 映射。
 */
export function createColorSwapScript(name: string, prefix?: string): string {
  return `(function () {
    var primary = localStorage.getItem(${JSON.stringify(`${name}-ui-primary`)});
    var neutral = localStorage.getItem(${JSON.stringify(`${name}-ui-neutral`)});
    if (!primary && !neutral) return;
    function resolve(color) {
      if (!color || !/^[a-z-]+$/.test(color)) return null;
      return color === 'neutral' ? 'old-neutral' : color;
    }
    function replace(html, pattern, color) {
      var resolved = resolve(color);
      return resolved ? html.replace(new RegExp(pattern, 'g'), '$1' + resolved + '$2') : html;
    }
    function swap(el) {
      var html = el.innerHTML;
      if (primary !== 'black') html = replace(html, ${JSON.stringify(shadePattern('primary', prefix))}, primary);
      html = replace(html, ${JSON.stringify(shadePattern('neutral', prefix))}, neutral);
      if (html !== el.innerHTML) el.innerHTML = html;
    }
    var el = document.querySelector('style#nuxt-ui-colors');
    if (el) return swap(el);
    var obs = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        for (var j = 0; j < mutations[i].addedNodes.length; j++) {
          var node = mutations[i].addedNodes[j];
          if (node.id === 'nuxt-ui-colors') {
            swap(node);
            obs.disconnect();
            return;
          }
        }
      }
    });
    obs.observe(document.head, { childList: true });
  })();`.replace(/\s+/g, ' ')
}
