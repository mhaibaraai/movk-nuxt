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
  address: string
  bio: string
  children?: Person[]
}

const FIRST = ['张', '李', '王', '陈', '刘', '杨', '黄', '赵', '吴', '周', '徐', '孙']
const LAST = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '涛', '明', '超']
const DEPARTMENTS: Person['department'][] = ['研发', '设计', '产品', '运营', '市场']
const ROLES = ['前端工程师', '后端工程师', '全栈工程师', 'UI 设计师', '产品经理', '数据分析师', '运营专员']
const LEVELS: Person['level'][] = ['P5', 'P6', 'P7', 'P8']
const STATUS: Person['status'][] = ['active', 'leave', 'offboarded']
const ADDRESSES = [
  '上海市浦东新区张江高科技园区博云路 2 号 IBM 大厦 7 层 708',
  '北京市海淀区中关村大街 27 号中关村大厦 A 座 1502',
  '深圳市南山区科技园南区高新南九道 9 号深圳湾科技生态园 10 栋 B 座 2301',
  '广州市天河区珠江新城华夏路 16 号富力盈凯广场 38 楼',
  '杭州市余杭区文一西路 969 号阿里巴巴西溪园区 6 号楼 318',
  '成都市高新区天府大道中段 1199 号天府软件园 D 区 5 号楼 1207',
  '南京市建邺区江东中路 222 号高科荣域大厦 19 层',
  '武汉市洪山区光谷大道 70 号光谷国际企业中心 3 期 B 座 1808'
]
const BIO_TEMPLATES = [
  '在跨境电商团队负责供应链与履约链路建设，主导过日均百万单的实时调度系统重构，关注稳定性与成本平衡。',
  '长期投入大数据平台与离线计算调度，搭建过 PB 级数据仓库与数据治理体系，对数据质量与权限治理有较强经验。',
  '聚焦设计系统与组件库建设，推动跨产品视觉一致性，主导多次 Design Tokens 与暗色主题落地。',
  '负责自研低代码平台与 BFF 中间层，输出过若干内部脚手架与 CLI 工具，关注研发效率与可维护性。',
  '深耕实时音视频与 WebRTC 互动场景，主导过千万级直播间的延迟优化与弱网降级方案。',
  '在 To B SaaS 团队负责权限、计费与多租户体系，对 RBAC、ABAC 与审计合规有完整落地经验。',
  '负责风控与反作弊算法工程化，搭建过实时特征平台与规则引擎，覆盖支付、营销、社交多场景。',
  '聚焦移动端性能优化与跨端渲染框架，主导过启动耗时、内存与包体积的全链路治理。'
]

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
    joinedAt: new Date(2018 + (seed % 7), seed % 12, 1 + (seed % 27)).toISOString().slice(0, 10),
    address: pick(ADDRESSES, seed * 17),
    bio: pick(BIO_TEMPLATES, seed * 19)
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
