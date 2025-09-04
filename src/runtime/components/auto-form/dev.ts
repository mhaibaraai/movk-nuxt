import type { AutoFormOptions } from '../../types'

export function devWarn(options: AutoFormOptions | undefined, ...args: any[]) {
  if (options?.logLevel === 'silent') return
  // eslint-disable-next-line no-console
  console.warn('[AutoForm]', ...args)
}

export function devDebug(options: AutoFormOptions | undefined, ...args: any[]) {
  if (options?.logLevel !== 'debug') return
  // eslint-disable-next-line no-console
  console.debug('[AutoForm]', ...args)
}


