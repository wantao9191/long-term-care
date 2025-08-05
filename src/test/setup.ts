import { vi } from 'vitest';

// 全局测试设置
beforeAll(() => {
  // 设置测试环境变量
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.JWT_EXPIRES_IN = '1h';
  
  // 模拟 console 方法以避免测试输出噪音
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  vi.restoreAllMocks();
});

// 全局测试工具函数
export const createMockUser = (overrides = {}) => ({
  id: 1,
  username: 'testuser',
  password: 'hashedpassword',
  phone: '13800138000',
  name: '测试用户',
  status: 1,
  createTime: new Date(),
  roles: [1],
  organizationId: 1,
  ...overrides
});

export const createMockOrganization = (overrides = {}) => ({
  id: 1,
  name: '测试机构',
  code: 'TEST001',
  description: '测试机构描述',
  status: 1,
  createTime: new Date(),
  ...overrides
});

export const createMockRole = (overrides = {}) => ({
  id: 1,
  name: '测试角色',
  code: 'TEST_ROLE',
  menus: [1, 2, 3],
  permissions: [1, 2, 3],
  description: '测试角色描述',
  status: 1,
  createTime: new Date(),
  ...overrides
});

export const createMockPermission = (overrides = {}) => ({
  id: 1,
  name: '测试权限',
  code: 'TEST_PERMISSION',
  description: '测试权限描述',
  status: 1,
  createTime: new Date(),
  roles: [1],
  ...overrides
});

export const createMockMenu = (overrides = {}) => ({
  id: 1,
  name: '测试菜单',
  code: 'TEST_MENU',
  description: '测试菜单描述',
  status: 1,
  createTime: new Date(),
  ...overrides
});

// 模拟数据库连接
export const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  execute: vi.fn(),
};

// 模拟 drizzle-orm 函数
export const mockDrizzle = {
  eq: vi.fn((a, b) => ({ a, b })),
  and: vi.fn((...args) => args),
  or: vi.fn((...args) => args),
  desc: vi.fn((field) => ({ field, order: 'desc' })),
  asc: vi.fn((field) => ({ field, order: 'asc' })),
  sql: vi.fn((str) => str),
}; 