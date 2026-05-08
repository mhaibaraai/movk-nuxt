export interface Person {
  id: string
  name: string
  email: string
  department: '研发' | '设计' | '产品' | '运营' | '市场'
  role: string
  level: 'P5' | 'P6' | 'P7' | 'P8'
  status: 'active' | 'leave' | 'offboarded'
  salary: number
  joinedAt: string
  children?: Person[]
}

const FIRST = ['张', '李', '王', '陈', '刘', '杨', '黄', '赵', '吴', '周', '徐', '孙']
const LAST = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '涛', '明', '超']
const DEPARTMENTS: Person['department'][] = ['研发', '设计', '产品', '运营', '市场']
const ROLES = ['前端工程师', '后端工程师', '全栈工程师', 'UI 设计师', '产品经理', '数据分析师', '运营专员']
const LEVELS: Person['level'][] = ['P5', 'P6', 'P7', 'P8']
const STATUS: Person['status'][] = ['active', 'leave', 'offboarded']

function pick<T>(list: readonly T[], seed: number): T {
  return list[seed % list.length] as T
}

export function makePerson(seed: number): Person {
  const first = pick(FIRST, seed)
  const last = pick(LAST, seed * 31 + 7)
  const dept = pick(DEPARTMENTS, seed * 7)
  return {
    id: `P${String(seed).padStart(4, '0')}`,
    name: `${first}${last}`,
    email: `user${seed}@movk.dev`,
    department: dept,
    role: pick(ROLES, seed * 3),
    level: pick(LEVELS, seed * 11),
    status: pick(STATUS, seed * 13),
    salary: 8000 + (seed * 257) % 50000,
    joinedAt: new Date(2018 + (seed % 7), seed % 12, 1 + (seed % 27)).toISOString().slice(0, 10)
  }
}

export function makePeople(count: number, offset = 0): Person[] {
  return Array.from({ length: count }, (_, i) => makePerson(offset + i + 1))
}

export function makePeopleTree(rootCount = 5, childPerRoot = 3): Person[] {
  return Array.from({ length: rootCount }, (_, i) => {
    const root = makePerson(i + 1)
    return {
      ...root,
      role: '团队负责人',
      children: Array.from({ length: childPerRoot }, (_, j) => makePerson((i + 1) * 100 + j + 1))
    }
  })
}
