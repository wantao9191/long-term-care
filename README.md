# 长期护理管理系统

基于 Astro + Vue + Drizzle ORM 的现代化长期护理管理系统。

## 🚀 项目结构

```text
/
├── public/                 # 静态资源
├── src/
│   ├── components/         # Vue 组件
│   ├── lib/               # 核心库文件
│   │   ├── auth/          # 认证模块
│   │   ├── db/            # 数据库模块
│   │   └── middleware/    # 中间件
│   ├── pages/             # 页面和 API 路由
│   ├── stores/            # Pinia 状态管理
│   ├── test/              # 测试文件
│   │   ├── unit/          # 单元测试
│   │   ├── integration/   # 集成测试
│   │   └── e2e/           # 端到端测试
│   └── types/             # TypeScript 类型定义
├── drizzle/               # 数据库迁移文件
└── package.json
```

## 🧞 命令

| 命令                   | 动作                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`             | 安装依赖                            |
| `pnpm dev`             | 启动开发服务器 `localhost:4321`      |
| `pnpm build`           | 构建生产版本到 `./dist/`          |
| `pnpm preview`         | 预览构建结果     |
| `pnpm test`            | 运行测试 |
| `pnpm test:run`        | 运行测试并生成报告 |
| `pnpm test:coverage`   | 运行测试并生成覆盖率报告 |
| `pnpm test:watch`      | 监听模式运行测试 |
| `pnpm db:generate`     | 生成数据库迁移文件 |
| `pnpm db:migrate`      | 执行数据库迁移 |
| `pnpm db:studio`       | 打开数据库管理界面 |
| `pnpm db:seed`         | 填充测试数据 |
| `pnpm lint`            | 代码检查 |
| `pnpm lint:fix`        | 自动修复代码问题 |
| `pnpm format`          | 格式化代码 |

## 🧪 测试

项目使用 Vitest 作为测试框架，包含以下测试类型：

### 单元测试 (`src/test/unit/`)
- **工具函数测试** (`utils.test.ts`): 测试密码加密、JWT 生成、日期格式化等工具函数
- **认证模块测试** (`auth.test.ts`): 测试登录、用户验证等认证功能
- **数据库模块测试** (`database.test.ts`): 测试数据库连接、CRUD 操作等

### 集成测试 (`src/test/integration/`)
- **中间件测试** (`middleware.test.ts`): 测试请求验证、表单验证、速率限制等中间件

### 端到端测试 (`src/test/e2e/`)
- **登录流程测试** (`login-flow.test.ts`): 测试完整的用户登录流程

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 监听模式运行测试
pnpm test:watch

# 运行特定测试文件
pnpm test src/test/unit/utils.test.ts
```

### 测试覆盖率

测试覆盖率报告会显示：
- 语句覆盖率 (Statements)
- 分支覆盖率 (Branches)
- 函数覆盖率 (Functions)
- 行覆盖率 (Lines)

## 🗄️ 数据库

项目使用 PostgreSQL 作为主数据库，Drizzle ORM 作为 ORM 框架。

### 数据表结构

- **organizations**: 机构表
- **users**: 用户表
- **roles**: 角色表
- **permissions**: 权限表
- **menus**: 菜单表

### 数据库操作

```bash
# 生成迁移文件
pnpm db:generate

# 执行迁移
pnpm db:migrate

# 打开数据库管理界面
pnpm db:studio

# 填充测试数据
pnpm db:seed
```

## 🔐 认证系统

系统使用 JWT (JSON Web Token) 进行用户认证：

- 密码使用 bcrypt 加密存储
- JWT token 包含用户信息和权限
- 支持验证码验证
- 实现速率限制防止暴力破解

## 🛡️ 安全特性

- 密码加密存储
- JWT 认证
- 验证码验证
- 速率限制
- 请求验证
- 错误处理

## 📝 开发指南

### 添加新功能

1. 在 `src/lib/` 下创建业务逻辑
2. 在 `src/pages/api/` 下创建 API 路由
3. 在 `src/components/` 下创建 Vue 组件
4. 编写相应的测试文件

### 编写测试

1. **单元测试**: 测试独立的函数和模块
2. **集成测试**: 测试模块间的交互
3. **端到端测试**: 测试完整的用户流程

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 编写清晰的测试用例

## 🚀 部署

### 环境变量

创建 `.env` 文件并配置以下变量：

```env
DATABASE_URL=postgresql://username:password@localhost:5432/database
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

### 构建和部署

```bash
# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

## �� 许可证

MIT License
