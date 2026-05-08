import { useAutoForm } from '#imports'

type LooseAfz = {
  string: (m?: unknown) => import('zod').ZodString
  number: (m?: unknown) => import('zod').ZodNumber
  boolean: (m?: unknown) => import('zod').ZodBoolean
  email: (m?: unknown) => import('zod').ZodString
  url: (m?: unknown) => import('zod').ZodString
  enum: (values: unknown, m?: unknown) => import('zod').ZodType
  array: (schema: unknown, m?: unknown) => import('zod').ZodArray<import('zod').ZodType>
  object: (shape: unknown, m?: unknown) => import('zod').ZodObject
  calendarDate: (m?: unknown) => import('zod').ZodType
  inputDate: (m?: unknown) => import('zod').ZodType
  inputTime: (m?: unknown) => import('zod').ZodType
  isoDate: (m?: unknown) => import('zod').ZodType
  file: (m?: unknown) => import('zod').ZodType
  layout: (config: unknown) => import('zod').ZodType
}

export const useFormBuilder = () => {
  const r = useAutoForm()
  return {
    ...r,
    afz: r.afz as unknown as LooseAfz
  }
}
