import type { UIMessageChunk } from 'ai'
import type { UIChunkSelector } from './types'

/** 未指定 id 时的单文本块，对齐 AI SDK 自己的 transformTextToUiMessageStream */
const DEFAULT_TEXT_ID = 'text-1'

/**
 * 后端分片流 → AI SDK 的 UIMessageChunk 流
 *
 * @description 领域侧只提供无状态的 `select`，生命周期全部由本转换器兜住：
 *  - `start` / `start-step` 只发一次
 *  - 按 id 开合文本块，同 id 的增量并入同一块
 *  - flush 时补齐所有未关闭的文本块与 `finish-step` / `finish`——后端不发结束信号或中途断流时，
 *    消息也不会永远停在 streaming
 */
export function createUIMessageLifecycle<Raw>(
  select: UIChunkSelector<Raw>
): TransformStream<Raw, UIMessageChunk> {
  const openTexts = new Set<string>()
  let started = false
  let finished = false

  function start(controller: TransformStreamDefaultController<UIMessageChunk>): void {
    if (started) return

    started = true
    controller.enqueue({ type: 'start' })
    controller.enqueue({ type: 'start-step' })
  }

  function finish(controller: TransformStreamDefaultController<UIMessageChunk>): void {
    if (finished) return

    finished = true

    for (const id of openTexts) {
      controller.enqueue({ type: 'text-end', id })
    }

    openTexts.clear()
    controller.enqueue({ type: 'finish-step' })
    controller.enqueue({ type: 'finish' })
  }

  return new TransformStream<Raw, UIMessageChunk>({
    transform(raw, controller) {
      if (finished) return

      const selection = select(raw)

      if (!selection) return

      const { id = DEFAULT_TEXT_ID, delta, end, data } = selection

      start(controller)

      if (data) {
        controller.enqueue({
          type: `data-${data.type}`,
          data: data.value,
          ...data.transient !== undefined && { transient: data.transient }
        })
      }

      if (delta) {
        if (!openTexts.has(id)) {
          openTexts.add(id)
          controller.enqueue({ type: 'text-start', id })
        }

        controller.enqueue({ type: 'text-delta', id, delta })
      }

      if (end && openTexts.delete(id)) {
        controller.enqueue({ type: 'text-end', id })
      }

      if (selection.finished) {
        finish(controller)
      }
    },

    flush(controller) {
      start(controller)
      finish(controller)
    }
  })
}
