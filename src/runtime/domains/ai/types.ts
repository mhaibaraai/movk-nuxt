/**
 * 一条后端分片映射出的 UI 片段意图
 *
 * @description 各字段互相独立，可同时给出（例如同一条分片既有增量文本、又是节点结束信号）
 */
export interface UIChunkSelection {
  /**
   * 文本块 id，同 id 的增量并入同一块
   * @defaultValue 'text-1'
   */
  id?: string
  /** 本片增量文本，为空则不产出 text-delta */
  delta?: string
  /** 该文本块到此结束 */
  end?: boolean
  /** 附带的自定义数据片 */
  data?: UIChunkData
  /** 整条流到此结束 */
  finished?: boolean
}

/**
 * 自定义数据片
 */
export interface UIChunkData {
  /** 片类型名，最终产出 `data-${type}` 片 */
  type: string
  /** 片负载 */
  value: unknown
  /**
   * 只走 `onData` 回调、不写入消息历史
   * @defaultValue false
   */
  transient?: boolean
}

/**
 * 后端分片 → UI 片段的纯映射，返回 undefined 表示该分片不产出任何片段
 */
export type UIChunkSelector<Raw> = (raw: Raw) => UIChunkSelection | undefined
