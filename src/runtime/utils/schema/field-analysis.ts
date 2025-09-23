import type { AutoFormField } from '../../types/auto-form'

// /**
//  * 检测字段是否为对象字段（容器字段）
//  * @param field 字段
//  * @returns 是否为对象字段
//  */
// export function isObjectField(field: AutoFormField): boolean {
//   return !!(field.children && field.children.length > 0)
// }

// /**
//  * 检测字段是否为叶子节点字段（有控件的字段）
//  * @param field 字段
//  * @returns 是否为叶子节点字段
//  */
// export function isLeafField(field: AutoFormField): boolean {
//   return !isObjectField(field)
// }

// /**
//  * 递归展平字段列表，只返回叶子节点字段
//  * @param fields 字段列表
//  * @returns 展平后的叶子节点字段列表
//  */
// export function flattenFields(fields: AutoFormField[]): AutoFormField[] {
//   const result: AutoFormField[] = []

//   for (const field of fields) {
//     if (isLeafField(field)) {
//       // 叶子节点直接添加
//       result.push(field)
//     }
//     else if (field.children) {
//       // 对象字段递归展平其子字段
//       result.push(...flattenFields(field.children))
//     }
//   }

//   return result
// }

// /**
//  * 检测字段列表中是否包含对象字段
//  * @param fields 字段列表
//  * @returns 是否包含对象字段
//  */
// export function hasObjectFields(fields: AutoFormField[]): boolean {
//   return fields.some(field => isObjectField(field))
// }

// /**
//  * 将字段按类型分组
//  * @param fields 字段列表
//  * @returns 分组后的字段
//  */
// export function groupFieldsByType(fields: AutoFormField[]) {
//   const objectFields: AutoFormField[] = []
//   const regularFields: AutoFormField[] = []

//   for (const field of fields) {
//     if (isObjectField(field)) {
//       objectFields.push(field)
//     }
//     else {
//       regularFields.push(field)
//     }
//   }

//   return {
//     objectFields,
//     regularFields,
//   }
// }

// /**
//  * 递归收集所有对象字段（包括嵌套的）
//  * @param fields 字段列表
//  * @returns 所有对象字段的扁平列表
//  */
// export function collectAllObjectFields(fields: AutoFormField[]): AutoFormField[] {
//   const result: AutoFormField[] = []

//   for (const field of fields) {
//     if (isObjectField(field)) {
//       result.push(field)
//       // 递归收集子字段中的对象字段
//       if (field.children) {
//         result.push(...collectAllObjectFields(field.children))
//       }
//     }
//   }

//   return result
// }

// /**
//  * 只收集顶级对象字段（不包括嵌套的）
//  * @param fields 字段列表
//  * @returns 顶级对象字段列表
//  */
// export function collectTopLevelObjectFields(fields: AutoFormField[]): AutoFormField[] {
//   return fields.filter(field => isObjectField(field))
// }
