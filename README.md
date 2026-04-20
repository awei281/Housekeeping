# Housekeeping

Housekeeping 是一个家政服务平台一期 MVP，使用 `pnpm` monorepo 管理前台官网、运营后台和 API 服务。

当前代码基线已经打通第一条核心业务链路：

- 官网展示与获客
- `/contact` 预约提交
- 后台登录
- 线索转客户
- 订单创建与员工指派
- CMS 页面内容维护
- 服务标准维护

## 当前完成范围

当前代码基线已完成 Task 1 到 Task 10，覆盖以下能力：

- 公开站点页面：`/`、`/about`、`/services`、`/standards`、`/contact`
- 仅 `/contact` 页面保留预约表单，提交后通过 Next.js API 路由转发到后端
- 官网线索已接入真实 `leads` 表
- 后台可查看仪表盘统计卡片
- 后台可管理线索、客户、订单、员工
- 已打通 `lead -> customer -> order -> employee -> assignment` 业务闭环
- 后台可维护官网内容页与服务标准
- 已提供基础部署脚手架：`docker-compose.yml`、`deploy/nginx.conf`

## 技术栈与目录

- `apps/web`：Next.js 15 官网
- `apps/admin`：Vite + React 19 + Ant Design 运营后台
- `apps/api`：NestJS 11 + Prisma + MySQL API
- `packages/contracts`：前后端共享 DTO、枚举与接口类型

## 数据模型概览

当前 Prisma 模型包含以下核心实体：

- `Lead`：官网预约线索
- `Customer`：客户
- `Order`：订单
- `Employee`：服务人员
- `ContentPage` / `ContentBlock`：CMS 页面与区块
- `ServiceStandard`：服务标准内容

## 本地开发前置条件

- Node.js 20+
- 已启用 `corepack`
- Docker Desktop

## 安装依赖

```powershell
corepack pnpm install
```

## 启动数据库

本项目已在 Docker MySQL 8 + 宿主机端口 `4306` 上验证通过。对当前 Windows 环境来说，`4306` 比 `3306/3307` 更稳妥。

推荐直接使用仓库内的 Compose 配置：

```powershell
$env:MYSQL_HOST_PORT = '4306'
docker compose up -d mysql
```

如果容器已经存在，可以直接启动：

```powershell
docker start housekeeping-mysql
```

也可以手动启动一个独立容器：

```powershell
docker run -d --name housekeeping-mysql-4306 `
  -e MYSQL_ROOT_PASSWORD=root `
  -e MYSQL_DATABASE=housekeeping `
  -p 4306:3306 `
  mysql:8
```

## 环境变量

当前仓库并不会自动共享单个根目录 `.env`，本地开发时建议先在 PowerShell 中显式设置环境变量，再分别启动各应用。

下面这组配置已经在本地验证通过：

```powershell
$env:DATABASE_URL = 'mysql://root:root@127.0.0.1:4306/housekeeping'
$env:JWT_SECRET = 'replace-me'
$env:ADMIN_USERNAME = 'admin'
$env:ADMIN_PASSWORD = 'admin123'
$env:API_PORT = '3200'
$env:NEXT_PUBLIC_API_URL = 'http://127.0.0.1:3200'
$env:API_BASE_URL = 'http://127.0.0.1:3200'
$env:VITE_API_BASE_URL = 'http://127.0.0.1:3200'
$env:PUBLIC_SITE_URL = 'http://127.0.0.1:3000'
$env:ADMIN_SITE_URL = 'http://127.0.0.1:3100'
```

变量用途如下：

- `DATABASE_URL`：Prisma 连接 MySQL
- `JWT_SECRET`：后台登录签名密钥
- `ADMIN_USERNAME` / `ADMIN_PASSWORD`：后台默认开发登录账号
- `API_PORT`：API 服务端口，默认 `3200`
- `NEXT_PUBLIC_API_URL`：官网服务端读取 API 的地址
- `API_BASE_URL`：官网 `/api/appointment` 代理转发目标地址
- `VITE_API_BASE_URL`：后台请求 API 的地址
- `PUBLIC_SITE_URL` / `ADMIN_SITE_URL`：可选，用于补充 API CORS 白名单

## 初始化数据库

依赖安装完成并设置好 `DATABASE_URL` 后，执行 Prisma 迁移：

```powershell
corepack pnpm --filter api exec prisma migrate deploy
```

当前仓库已经包含两组迁移：

- `20260418111317_init_core`
- `20260419103719_add_content_management`

## 启动项目

推荐分别启动三个应用。

API：

```powershell
corepack pnpm --filter api start:dev
```

如果当前 Windows 环境下 `nest start --watch` 表现不稳定，可以先构建再直接运行产物：

```powershell
corepack pnpm --filter api build
node apps/api/dist/apps/api/src/main.js
```

后台：

```powershell
corepack pnpm --filter admin exec vite --host 127.0.0.1 --port 3100
```

官网：

```powershell
corepack pnpm --filter web exec next dev --hostname 127.0.0.1 --port 3000
```

默认本地访问地址：

- 官网：`http://127.0.0.1:3000`
- 后台：`http://127.0.0.1:3100`
- API：`http://127.0.0.1:3200`

## 后台默认开发账号

后台登录默认读取环境变量 `ADMIN_USERNAME` 与 `ADMIN_PASSWORD`；如果未设置，则回退为以下开发凭据：

- 用户名：`admin`
- 密码：`admin123`
- 角色：`super_admin`

## 本地联调说明

当前 API 的 CORS 已显式兼容以下本地开发来源：

- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://localhost:3100`
- `http://127.0.0.1:3100`

这意味着前台或后台即使分别使用 `localhost` 与 `127.0.0.1` 访问，也不会再因为预检请求被拦截而出现后台登录 `Failed to fetch`。

## 已验证能力

以下链路已针对本地 Docker MySQL 环境实际跑通过：

1. 官网提交预约线索
2. 后台登录
3. 查看仪表盘统计
4. 将线索转为客户
5. 创建订单
6. 创建员工
7. 给订单指派员工
8. 更新 `standards` 页面 CMS 内容
9. 创建并更新服务标准
10. 在官网读取最新服务标准内容

## 可用脚本

根工作区脚本：

```powershell
corepack pnpm dev:web
corepack pnpm dev:admin
corepack pnpm dev:api
corepack pnpm build
corepack pnpm lint
corepack pnpm test
```

当前脚本状态说明：

- `build` 已可用于整个工作区
- `apps/api` 已配置 E2E 测试
- `apps/web` 与 `apps/admin` 的 `lint` / `test` 目前仍是占位脚本

## 已执行过的验证命令

以下命令在当前代码基线上已经跑通：

```powershell
corepack pnpm lint
corepack pnpm test
corepack pnpm build
corepack pnpm --filter contracts exec tsc --noEmit
corepack pnpm --filter api test
corepack pnpm --filter api build
corepack pnpm --filter admin build
corepack pnpm --filter web build
docker compose config
```

补充说明：

- 官网内容与服务标准读取使用 `cache: "no-store"`，`/standards` 页面会优先反映最新 CMS 更新

## 部署脚手架

仓库当前提供的是“可继续完善”的部署基础，不是生产级一键上线方案：

- `docker-compose.yml`：当前用于本地拉起 MySQL，默认宿主机端口为 `4306`
- `deploy/nginx.conf`：提供基础反向代理结构
- 公网站点默认走 `80`
- 后台默认走 `8080`
- API 通过 `/api/` 反向代理

## 继续开发时的约束

- 不要直接在 `main` 上开发
- 当前延续记录文件为 `Housekeeping_AI续做上下文.md`
- 当前阶段只允许 `/contact` 页面承载预约表单，其他页面不应再重复放置表单
