// 基础控件默认映射：可按需扩充
export const defaultControls: Record<string, { component?: any, defaults?: Record<string, any> }> = {
  ZodString: { component: (globalThis as any).UInput },
  ZodNumber: { component: (globalThis as any).UInputNumber },
  ZodBoolean: { component: (globalThis as any).USwitch },
  ZodEnum: { component: (globalThis as any).USelect },
  ZodNativeEnum: { component: (globalThis as any).USelect },
}
