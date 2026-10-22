type Listener = (event: Event | ProgressEvent) => void

class MockUpload {
  listeners: Listener[] = []
  addEventListener(_type: string, listener: Listener) {
    this.listeners.push(listener)
  }
}

/** 可手动驱动事件的 XMLHttpRequest 替身 */
export class MockXHR {
  static instances: MockXHR[] = []
  upload = new MockUpload()
  method = ''
  url = ''
  body: unknown
  status = 200
  statusText = 'OK'
  response: unknown = null
  responseType = ''
  withCredentials = false
  requestHeaders: Record<string, string> = {}
  responseHeaders: Record<string, string> = { 'content-type': 'application/json' }
  private listeners: Record<string, Listener[]> = {}

  constructor() {
    MockXHR.instances.push(this)
  }

  open(method: string, url: string) {
    this.method = method
    this.url = url
  }

  setRequestHeader(name: string, value: string) {
    this.requestHeaders[name] = value
  }

  send(body: unknown) {
    this.body = body
  }

  abort() {
    this.dispatch('abort')
  }

  addEventListener(type: string, listener: Listener) {
    (this.listeners[type] ||= []).push(listener)
  }

  getAllResponseHeaders(): string {
    return Object.entries(this.responseHeaders).map(([k, v]) => `${k}: ${v}`).join('\r\n')
  }

  dispatch(type: string) {
    for (const listener of this.listeners[type] || []) listener(new Event(type))
  }

  /** 以 JSON 响应体完成请求 */
  respond(body: unknown, status = 200) {
    this.status = status
    this.response = new Blob([JSON.stringify(body)], { type: 'application/json' })
    this.dispatch('load')
  }

  triggerUploadProgress(loaded: number, total: number) {
    for (const listener of this.upload.listeners) {
      listener({ lengthComputable: true, loaded, total } as ProgressEvent)
    }
  }
}

/** 等待 ofetch 走完异步钩子、真正调用 xhr.send */
export async function nextXhr(): Promise<MockXHR> {
  for (let i = 0; i < 20 && MockXHR.instances.length === 0; i++) {
    await new Promise(resolve => setTimeout(resolve, 0))
  }
  return MockXHR.instances.at(-1)!
}
