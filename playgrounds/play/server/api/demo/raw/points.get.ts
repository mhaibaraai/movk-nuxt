export default defineEventHandler(async () => {
  await new Promise(r => setTimeout(r, 200))

  // 裸资源：直接返回数组，没有 code/message/data 信封
  return [
    { point_number: 'DP201A_H', point_name: '反滤芯压降 A 高压端', detection_type: '差压' },
    { point_number: 'TE101', point_name: '入口温度', detection_type: '温度' }
  ]
})
