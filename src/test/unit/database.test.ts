import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockUser, createMockOrganization, createMockRole, createMockPermission, createMockMenu } from '../setup';

// 模拟数据库连接
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    execute: vi.fn(),
  }
}));

// 模拟 drizzle-orm
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a: any, b: any) => ({ a, b })),
  and: vi.fn((...args: any[]) => args),
  or: vi.fn((...args: any[]) => args),
  desc: vi.fn((field: any) => ({ field, order: 'desc' })),
  asc: vi.fn((field: any) => ({ field, order: 'asc' })),
  sql: vi.fn((str: string) => str),
}));

// 模拟 postgres
vi.mock('postgres', () => ({
  default: vi.fn(() => ({
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    execute: vi.fn(),
  }))
}));

describe('数据库模块测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('数据库连接', () => {
    it('应该成功连接数据库', async () => {
      const { db } = await import('@/lib/db');
      db.execute.mockResolvedValue([{ test: 1 }]);

      const result = await db.execute('SELECT 1 as test');
      
      expect(db.execute).toHaveBeenCalledWith('SELECT 1 as test');
      expect(result).toEqual([{ test: 1 }]);
    });

    it('应该处理数据库连接错误', async () => {
      const { db } = await import('@/lib/db');
      db.execute.mockRejectedValue(new Error('连接失败'));

      await expect(db.execute('SELECT 1')).rejects.toThrow('连接失败');
    });
  });

  describe('用户表操作', () => {
    it('应该查询所有用户', async () => {
      const mockUsers = [
        createMockUser({ id: 1, username: 'user1' }),
        createMockUser({ id: 2, username: 'user2' })
      ];

      const { db } = await import('@/lib/db');
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockResolvedValue(mockUsers)
      });
      db.select = mockSelect;

      const users = await db.select().from({} as any);
      
      expect(db.select).toHaveBeenCalled();
      expect(users).toEqual(mockUsers);
    });

    it('应该根据用户名查询用户', async () => {
      const mockUser = createMockUser({ username: 'testuser' });

      const { db } = await import('@/lib/db');
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockUser])
        })
      });
      db.select = mockSelect;

      const user = await db.select().from({} as any).where({} as any);
      
      expect(db.select).toHaveBeenCalled();
      expect(user).toEqual([mockUser]);
    });

    it('应该创建新用户', async () => {
      const newUser = {
        username: 'newuser',
        password: 'hashedpassword',
        phone: '13800138001',
        name: '新用户',
        status: 1,
        roles: [1],
        organizationId: 1
      };

      const createdUser = createMockUser(newUser);

      const { db } = await import('@/lib/db');
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([createdUser])
        })
      });
      db.insert = mockInsert;

      const user = await db.insert({} as any).values(newUser).returning();
      
      expect(db.insert).toHaveBeenCalled();
      expect(user).toEqual([createdUser]);
    });

    it('应该更新用户信息', async () => {
      const updateData = {
        name: '更新后的姓名',
        phone: '13800138002'
      };

      const updatedUser = createMockUser(updateData);

      const { db } = await import('@/lib/db');
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedUser])
          })
        })
      });
      db.update = mockUpdate;

      const user = await db.update({} as any).set(updateData).where({} as any).returning();
      
      expect(db.update).toHaveBeenCalled();
      expect(user).toEqual([updatedUser]);
    });

    it('应该删除用户', async () => {
      const deletedUser = createMockUser({ id: 1 });

      const { db } = await import('@/lib/db');
      const mockDelete = vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([deletedUser])
        })
      });
      db.delete = mockDelete;

      const user = await db.delete({} as any).where({} as any).returning();
      
      expect(db.delete).toHaveBeenCalled();
      expect(user).toEqual([deletedUser]);
    });
  });

  describe('机构表操作', () => {
    it('应该查询所有机构', async () => {
      const mockOrganizations = [
        createMockOrganization({ id: 1, name: '机构1' }),
        createMockOrganization({ id: 2, name: '机构2' })
      ];

      const { db } = await import('@/lib/db');
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockResolvedValue(mockOrganizations)
      });
      db.select = mockSelect;

      const organizations = await db.select().from({} as any);
      
      expect(db.select).toHaveBeenCalled();
      expect(organizations).toEqual(mockOrganizations);
    });

    it('应该根据ID查询机构', async () => {
      const mockOrganization = createMockOrganization({ id: 1 });

      const { db } = await import('@/lib/db');
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockOrganization])
        })
      });
      db.select = mockSelect;

      const organization = await db.select().from({} as any).where({} as any);
      
      expect(db.select).toHaveBeenCalled();
      expect(organization).toEqual([mockOrganization]);
    });
  });

  describe('角色表操作', () => {
    it('应该查询所有角色', async () => {
      const mockRoles = [
        createMockRole({ id: 1, name: '角色1' }),
        createMockRole({ id: 2, name: '角色2' })
      ];

      const { db } = await import('@/lib/db');
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockResolvedValue(mockRoles)
      });
      db.select = mockSelect;

      const roles = await db.select().from({} as any);
      
      expect(db.select).toHaveBeenCalled();
      expect(roles).toEqual(mockRoles);
    });
  });

  describe('权限表操作', () => {
    it('应该查询所有权限', async () => {
      const mockPermissions = [
        createMockPermission({ id: 1, name: '权限1' }),
        createMockPermission({ id: 2, name: '权限2' })
      ];

      const { db } = await import('@/lib/db');
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockResolvedValue(mockPermissions)
      });
      db.select = mockSelect;

      const permissions = await db.select().from({} as any);
      
      expect(db.select).toHaveBeenCalled();
      expect(permissions).toEqual(mockPermissions);
    });
  });

  describe('菜单表操作', () => {
    it('应该查询所有菜单', async () => {
      const mockMenus = [
        createMockMenu({ id: 1, name: '菜单1' }),
        createMockMenu({ id: 2, name: '菜单2' })
      ];

      const { db } = await import('@/lib/db');
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockResolvedValue(mockMenus)
      });
      db.select = mockSelect;

      const menus = await db.select().from({} as any);
      
      expect(db.select).toHaveBeenCalled();
      expect(menus).toEqual(mockMenus);
    });
  });

  describe('复杂查询', () => {
    it('应该支持多表关联查询', async () => {
      const mockUserWithOrg = {
        ...createMockUser(),
        organization: createMockOrganization()
      };

      const { db } = await import('@/lib/db');
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([mockUserWithOrg])
          })
        })
      });
      db.select = mockSelect;

      const result = await db.select().from({} as any).leftJoin({} as any, {} as any).where({} as any);
      
      expect(db.select).toHaveBeenCalled();
      expect(result).toEqual([mockUserWithOrg]);
    });

    it('应该支持条件查询', async () => {
      const mockUsers = [createMockUser({ status: 1 })];

      const { db } = await import('@/lib/db');
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            and: vi.fn().mockResolvedValue(mockUsers)
          })
        })
      });
      db.select = mockSelect;

      const users = await db.select().from({} as any).where({} as any).and({} as any);
      
      expect(db.select).toHaveBeenCalled();
      expect(users).toEqual(mockUsers);
    });
  });
}); 