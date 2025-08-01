import { pgTable, bigserial, varchar, timestamp, integer, text, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

//  机构表
export const organizations = pgTable('organizations', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 50 }).unique().notNull(),
  description: text('description'),
  status: integer('status').default(1), // 0: 禁用, 1: 启用
  createTime: timestamp('create_time').defaultNow(),
}); 
//  角色表
export const roles = pgTable('roles',{
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  code: varchar('code', { length: 50 }).unique().notNull(),
  menus: json('menus').$type<bigint[]>(),
  permissions: json('permissions').$type<bigint[]>(),
  description: text('description'),
  status: integer('status').default(1), // 0: 禁用, 1: 启用
  createTime: timestamp('create_time').defaultNow(),
})
//  用户表
export const users = pgTable('users',{
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  username:varchar('username', { length: 50 }).notNull(),
  password:varchar('password', { length: 255 }).notNull(),
  phone:varchar('phone', { length: 11 }).notNull(),
  name:varchar('name', { length: 50 }).notNull(),
  status: integer('status').default(1), // 0: 禁用, 1: 启用
  createTime: timestamp('create_time').defaultNow(),
  roles: json('roles').$type<bigint[]>(),
  organizationId: bigserial('organization_id', { mode: 'bigint' }).references(() => organizations.id), // 修改这里
})
//  权限表
export const permissions = pgTable('permissions',{
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  code: varchar('code', { length: 50 }).unique().notNull(),
  description: text('description'),
  status: integer('status').default(1), // 0: 禁用, 1: 启用
  createTime: timestamp('create_time').defaultNow(),
  roles: json('roles').$type<bigint[]>(),
})
//  菜单表
export const menus = pgTable('menus',{
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  code: varchar('code', { length: 50 }).unique().notNull(),
  description: text('description'),
  status: integer('status').default(1), // 0: 禁用, 1: 启用
  createTime: timestamp('create_time').defaultNow(),
})

