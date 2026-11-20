import type { RequestToastOptions } from '../../types/api'
import { simpleHash } from '@movk/core'

interface ApiFetchKeyInput {
  endpoint?: string
  businessCheck?: boolean
  unwrap?: boolean
  toast?: RequestToastOptions | false
  method?: string
  url: unknown
  query?: unknown
  body?: unknown
}

/**
 * 计算 useApiFetch 的去重 key
 *
 * @description 纳入所有影响处理逻辑的维度（含请求级 toast），避免同 URL 不同 toast 配置
 * 因 key 相同被 Nuxt useAsyncData 去重，复用首个 handler 导致单次配置失效。
 * 入参须为已 resolve 的值（调用方负责 toValue）。
 */
export function buildApiFetchKey(input: ApiFetchKeyInput): string {
  const { endpoint, businessCheck, unwrap, toast, method, url, query, body } = input
  // 三态保留：显式 false 与未传（继承端点配置）的处理逻辑不同，不能折叠成同一 key
  const payload = {
    e: endpoint ?? null,
    bc: businessCheck ?? null,
    uw: unwrap ?? null,
    t: toast ?? null,
    m: method ?? 'GET',
    u: url,
    q: query ?? null,
    b: body ?? null
  }
  let raw: string
  try {
    raw = JSON.stringify(payload)
  }
  catch {
    // body/query 含循环引用 / FormData / File 等不可序列化数据时退化：用户应自传 key
    const toastTag = toast === false ? 'off' : toast ? 'obj' : ''
    const urlTag = typeof url === 'string' ? url : '<req>'
    raw = `${endpoint ?? ''}|${businessCheck}|${unwrap}|${toastTag}|${payload.m}|${urlTag}|<body>`
  }
  return `mvk-api:${simpleHash(raw)}`
}
