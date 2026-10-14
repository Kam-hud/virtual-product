# VirtualStore 上线部署手册

架构：前端 GitHub Pages + 后端 Vercel Serverless (Express+PG) + 数据库 Supabase (PostgreSQL)。

## 0. 前置条件

- GitHub 仓库：`Kam-hud/virtual-product`，分支 `feat/relaunch`（已推送全部改造代码）
- 需要三个账号：GitHub（已有）、Supabase（免费）、Vercel（免费）

---

## 1. 数据库：Supabase 建库（约 5 分钟）

1. 打开 https://supabase.com ，登录/注册（免费版即可）
2. 创建新项目：`New Project`
   - Name: `virtual-store`
   - Database Password: 记下这个密码（后续连接串要用）
   - Region: 选 `Singapore`（国内访问较快）
3. 项目创建完成后，左侧菜单 `SQL Editor` → `New query`
4. 依次粘贴执行以下两个文件的内容（先 schema 后 seed）：
   - `db/schema.sql`
   - `db/seed.sql`
5. 左侧 `Table Editor` 确认出现 6 张表（users / category / product / cart / orders / order_items）且有 16 条商品数据
6. 左侧 `Project Settings` → `Database` → `Connection string`（URI 格式），复制连接串备用

> 连接串形如：`postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`

---

## 2. 后端：Vercel 部署（约 5 分钟）

1. 打开 https://vercel.com ，登录（建议直接用 GitHub 账号登录）
2. `Add New...` → `Project` → 导入仓库 `Kam-hud/virtual-product`
3. 选择分支 `feat/relaunch`
4. **Framework Preset**: 选择 `Other`（本项目仓库同时含前端，Vercel 只部署后端 api/）
   - Root Directory: `/`
   - Build Command: 留空
   - Output Directory: 留空
5. 添加环境变量（`Settings` → `Environment Variables`）：
   - `DATABASE_URL` = 第 1 步复制的 Supabase 连接串
   - `JWT_SECRET` = 一段随机长字符串（如 `openssl rand -hex 32` 生成）
   - `CORS_ORIGIN` = `https://kam-hud.github.io`（部署后如有报 CORS 再加实际前端域名）
6. `Deploy`，等待部署完成，得到后端域名 `https://xxx.vercel.app`
7. 验证：浏览器访问 `https://xxx.vercel.app/api/health`，应返回
   `{"status":"OK","database":"connected",...}`

> 后端改造已适配 Serverless：`api/index.js` 导出 Express app，`vercel.json` 将 `/api/*` 重写至该函数；上传接口在 Serverless 下仅校验不入盘。

---

## 3. 前端：GitHub Pages（约 3 分钟）

已提交 `.github/workflows/deploy-pages.yml`，推送 `feat/relaunch` 分支会自动构建并发布 `dist`。

1. 打开仓库 https://github.com/Kam-hud/virtual-product → `Settings` → `Pages`
2. `Source` 选择 `GitHub Actions`
3. 回到仓库 `Actions` 标签，等待 `Deploy Frontend to GitHub Pages` 运行成功
4. 前端地址：`https://kam-hud.github.io/virtual-product/`

> 如果后端域名与 Pages 域名不一致需要设置 `VITE_API_BASE`：仓库 `Settings` → `Secrets and variables` → `Actions` → `New repository secret`：
> - Name: `VITE_API_BASE`
> - Value: `https://xxx.vercel.app`（第 2 步的后端域名）
> 设置后重新推送（或手动触发 workflow），构建时自动注入。

---

## 4. 总验收清单

| 项目 | 操作 | 预期 |
|------|------|------|
| 健康检查 | 访问 `/api/health` | `database: connected` |
| 注册 | 前端注册新账号 | 成功并自动登录 |
| 登录 | 使用 `admin / admin123` | 成功，Header 显示管理入口 |
| 商品列表 | 首页浏览 | 16 商品按 8 分类展示 |
| 商品详情 | 进入任意商品 | 正常展示并可加入购物车 |
| 购物车 | 勾选/改数量/结算 | 正常联动 |
| 下单支付 | 结算页模拟支付 | 生成订单、状态 paid |
| 我的订单 | 查看订单/详情 | 显示订单与明细 |
| 管理后台 | `/admin` | 统计/商品管理/订单管理可用 |
| 静态兜底 | 停止后端后刷新首页/商品页 | 展示演示数据，不可下单 |

---

## 5. 本地开发

```bash
# 后端（需本地 PostgreSQL 或改 DATABASE_URL 指向 Supabase）
cp .env.example .env   # 按需修改
npm run server

# 前端
npm run dev            # http://localhost:5173，/api 自动代理到 :3001
```
