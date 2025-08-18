import { pgTable, varchar, timestamp, integer, text, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

//  机构表
export const organizations = pgTable('organizations', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 50 }).unique().notNull(),
  description: text('description'),
  status: integer('status').default(1), // 0: 禁用, 1: 启用
  createTime: timestamp('create_time').defaultNow(),
}); 
//  角色表
export const roles = pgTable('roles',{
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 50 }).notNull(),
  code: varchar('code', { length: 50 }).unique().notNull(),
  menus: json('menus').$type<number[]>(),
  permissions: json('permissions').$type<number[]>(),
  description: text('description'),
  status: integer('status').default(1), // 0: 禁用, 1: 启用
  createTime: timestamp('create_time').defaultNow(),
})
//  用户表
export const users = pgTable('users',{
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  username:varchar('username', { length: 50 }).notNull(),
  password:varchar('password', { length: 255 }).notNull(),
  phone:varchar('phone', { length: 11 }).notNull(),
  name:varchar('name', { length: 50 }).notNull(),
  status: integer('status').default(1), // 0: 禁用, 1: 启用
  createTime: timestamp('create_time').defaultNow(),
  roles: json('roles').$type<number[]>(),
  organizationId: integer('organization_id').references(() => organizations.id), // 修改这里
})
//  权限表
export const permissions = pgTable('permissions',{
  id:integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 50 }).notNull(),
  code: varchar('code', { length: 50 }).unique().notNull(),
  description: text('description'),
  status: integer('status').default(1), // 0: 禁用, 1: 启用
  createTime: timestamp('create_time').defaultNow(),
  roles: json('roles').$type<number[]>(),
})
//  菜单表
export const menus = pgTable('menus',{
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 50 }).notNull(),
  code: varchar('code', { length: 50 }).unique().notNull(),
  description: text('description'),
  status: integer('status').default(1), // 0: 禁用, 1: 启用
  createTime: timestamp('create_time').defaultNow(),
})

