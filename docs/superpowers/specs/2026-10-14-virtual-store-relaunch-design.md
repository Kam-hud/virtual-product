# VirtualStore 上线改造设计文档

- 日期：2026-10-14
- 项目：https://github.com/Kam-hud/virtual-product（虚拟商品商城 VirtualStore）
- 目标：修复安全与功能缺口，重建数据库，完成上线

## 1. 背景与现状结论

原项目为 Vue 3 + Vite + Element Plus + Pinia 前端、Express + MySQL 后端的虚拟商品商城 Demo。审查结论：

- 前端 UI 约 70% 完成，页面齐全；业务闭环约 35%（交易链路未打通）
- 已完成：注册（含头像上传）、登录、商品列表、商品详情、购物车（部分可用）、结算页 UI 壳
- 未完成：订单系统、支付、商品交付、管理后台、个人中心、搜索、结算页逻辑
- 安全问题：密码明文存储与比较（bcrypt 未用）、无认证机制（IDOR 越权）、.env 含数据库密码已提交进仓库、上传无类型/尺寸过滤、错误响应泄漏 SQL、日志打印明文密码、CORS 硬编码
- 质量问题：主 bundle 1.16MB（Element Plus 全量引入）、logo 4MB/banner 657-918KB 未压缩、API baseURL 硬编码 localhost、README 为脚手架模板、无建表 SQL、无 ESLint/测试/CI

## 2. 上线形态（用户已确认的决策）

| 决策项 | 选择 |
|---|---|
| 部署 | 前端 GitHub Pages + 免费后端平台（Vercel） |
| 数据库 | Supabase 免费 Postgres（原 MySQL 数据已丢失，全部重建） |
| 支付 | 模拟支付闭环（UI + 自动标记已支付并发放交付内容，后续有资质再接真实支付） |
| 管理后台 | 需要（商品 CRUD + 分类管理） |
| 数据来源 | 重建表结构 + 生成覆盖全分类的示例种子数据，真实商品后续由管理后台维护 |
| 兜底 | 后端/数据库不可用时，前端自动降级展示内置静态数据 |

## 3. 整体架构

```
GitHub Pages (静态前端 Vue3)  ──HTTPS──▶  Vercel Serverless (Express API)
                                                  │
                                                  ▼
                                    Supabase (Postgres + Storage + Auth)
```

- 前端：现有 Vue 3 代码改造，构建产物部署 GitHub Pages
- 后端：现有 Express 代码改造为 Vercel Serverless Functions，保留业务逻辑主体
- 数据：Supabase Postgres；商品图片存 Supabase Storage（替换本地 uploads）
- 部署参考既有经验：Vercel 识别多服务目录需 vercel.json；根目录放依赖清单；API 入口拆分导出

## 4. 数据模型（重建）

### 4.1 表结构

```
users
  id            bigserial PK
  username      varchar(50) NOT NULL UNIQUE
  email         varchar(100) NOT NULL UNIQUE
  password_hash varchar(255) NOT NULL        -- bcrypt hash，不再存明文
  avatar        varchar(500)                 -- Supabase Storage 路径
  role          varchar(20) DEFAULT 'user'   -- user / admin
  created_at    timestamptz DEFAULT now()

category
  id     bigserial PK
  name   varchar(50) NOT NULL
  icon   varchar(50)                        -- Element Plus 图标名
  sort   int DEFAULT 0

product
  id               bigserial PK
  name             varchar(100) NOT NULL
  description      text
  details          text
  price            numeric(10,2) NOT NULL
  original_price   numeric(10,2)
  image            varchar(500)
  category_id      bigint REFERENCES category(id)
  tag              varchar(50)
  status           varchar(10) DEFAULT 'on'  -- on / off（上下架）
  delivery_content text                     -- 交付内容（卡密/链接/说明）
  sales            int DEFAULT 0
  rating           numeric(2,1) DEFAULT 5.0
  created_at       timestamptz DEFAULT now()

cart
  id         bigserial PK
  user_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE
  product_id bigint NOT NULL REFERENCES product(id)
  quantity   int NOT NULL DEFAULT 1
  selected   boolean NOT NULL DEFAULT true
  created_at timestamptz DEFAULT now()
  UNIQUE (user_id, product_id)

orders
  id              bigserial PK
  order_no        varchar(32) NOT NULL UNIQUE   -- 如 VP+时间戳+随机
  user_id         bigint NOT NULL REFERENCES users(id)
  total_amount    numeric(10,2) NOT NULL
  discount_amount numeric(10,2) DEFAULT 0
  status          varchar(20) DEFAULT 'pending' -- pending/paid/completed/refunded
  payment_method  varchar(20)                   -- wechat/alipay/card/balance
  created_at      timestamptz DEFAULT now()
  paid_at         timestamptz

order_items
  id               bigserial PK
  order_id         bigint NOT NULL REFERENCES orders(id) ON DELETE CASCADE
  product_id       bigint NOT NULL
  product_name     varchar(100) NOT NULL        -- 下单时快照
  product_image    varchar(500)
  price            numeric(10,2) NOT NULL       -- 下单时快照
  quantity         int NOT NULL DEFAULT 1
  delivery_content text                        -- 下单时快照
```

### 4.2 种子数据

- 8 个分类：全部/软件/虚拟物品/课程/素材/影视/音乐/模板（icon 沿用现前端图标）
- 约 16 个示例商品：每分类 2 个，字段完整（名称/描述/价格/原价/图片/交付内容/上下架 on），图片先复用本地 assets 或占位图
- 账号：admin 管理员 1 个（role=admin）、测试用户 1 个（role=user），密码 bcrypt 预生成 hash
- 交付形式：`schema.sql`（建表）+ `seed.sql`（分类/商品/账号）

## 5. 后端改造（Express → Vercel Serverless）

### 5.1 认证与安全

- bcrypt：注册 `hashSync`、登录 `compareSync`；存量明文密码不迁移（数据已丢失，无存量）
- JWT：登录签发 token（含 userId/role，有效期如 7 天），`Authorization: Bearer` 鉴权中间件
- 购物车/订单接口一律从 token 取 userId，禁止客户端传 userId（修复 IDOR）
- 管理员接口校验 role === 'admin'
- 上传：白名单 `image/jpeg/png/gif/webp` + 大小 ≤ 5MB → Supabase Storage，返回公开 URL
- 移除 `error.sql` 等 SQL 泄漏；移除密码明文日志
- `.env` 移出版本库，新增 `.env.example`；.gitignore 增加 `.env`

### 5.2 接口清单

保留（修复）：
- `POST /api/register`（hash 密码）
- `POST /api/login`（返回 token + 用户信息）
- `GET /api/products`、`GET /api/products/:id`（仅 status=on；detail 供管理后台查全部）
- `GET /api/cart`（从 token 取 userId；返回 selected 真实值）
- `POST /api/cart`（body: productId, quantity；已存在则累加）
- `PUT /api/cart/:cartId`（body: quantity 或 selected，合并为单 handler）
- `DELETE /api/cart/:cartId`（删单个）
- `DELETE /api/cart/user`（清空，独立路由，修复原 404）
- `PUT /api/cart/selection/all`（全选，独立路由）
- `GET /api/health`（供前端兜底探测）

新增：
- `POST /api/orders`（从购物车选中项生成订单 + order_items 快照，事务）
- `POST /api/orders/:id/pay`（模拟支付：校验归属 → 置 paid、写 paid_at、扣减库存/累加销量，返回交付内容清单）
- `GET /api/orders/my`（我的订单列表）
- `GET /api/orders/:id`（订单详情含交付内容）
- `GET /api/search?q=`（商品名模糊搜索）
- 管理后台：`GET/POST /api/admin/products`、`PUT/DELETE /api/admin/products/:id`、`POST /api/admin/products/:id/toggle`（上下架）、`GET/POST /api/admin/categories`、`PUT/DELETE /api/admin/categories/:id`

### 5.3 Serverless 适配

- `src/server/server.js` 拆分为：`api/index.js`（导出 app，去掉 app.listen）+ 路由模块
- 数据库连接池改为按需连接（Supabase pg 连接串），不常驻
- 根目录 `vercel.json`：API 路由指向 api 入口，静态文件指向 dist；根目录放置依赖清单（package.json 或 requirements 风格，按 Vercel Node 运行时要求）
- CORS origin 与环境变量化（VITE 部署域名）

## 6. 前端改造

### 6.1 功能

- axios 封装：baseURL 读 `VITE_API_BASE`（部署时填 Vercel 域名，本地走 vite proxy）；请求拦截器附 JWT；响应拦截统一错误提示
- 路由守卫：`/cart`、`/checkout` 需登录；`/admin` 需 admin；未登录跳 /login
- checkout.vue 重写：补齐 activeStep/discountAmount/couponCode/paymentMethod/orderId 等变量与 applyCoupon/removeCoupon/handlePayment/viewOrder/goHome 函数；订单确认用选中购物车项 → 模拟支付 → 完成页展示交付内容
- 购物车 store 修复：addItem 后重新 loadCart（不 push 响应体）；selected 从后端读取；清空/选中调用修复后的路由
- 新增 `/admin`：商品列表/新增/编辑/上下架/交付内容维护、分类管理
- Header 搜索：声明 searchKeyword，回车/点击调用搜索接口并跳转结果展示
- 个人中心简版 `/profile`：资料展示 + 我的订单列表（可选，若时间紧可合并入订单页）

### 6.2 静态数据兜底（核心新增）

- 新增 `src/data/fallbackData.js`：内置商品数组（与后端字段一致：id/name/description/details/price/originalPrice/image/tag/categoryId/rating/sales），覆盖全部 8 分类
- api 层降级：`GET /products`、`GET /products/:id` 失败（网络错误/超时/5xx）→ 返回静态数据，页面正常渲染
- 启动探测：App 挂载时调 `GET /health`，失败置全局 `demoMode=true`
- UI 标识：demoMode 下商品卡片/详情显示"演示数据"标签；购物车/订单/登录/管理后台提示"服务暂不可用"，阻止写入脏数据
- 隔离：兜底逻辑只影响读接口，不伪造用户态数据

### 6.3 构建与质量

- Element Plus 按需引入（unplugin-vue-components + unplugin-auto-import），目标主包 ≤ 300KB gzip
- 图片压缩：logo（4MB→≤200KB）、banner（→≤200KB）
- README 重写：项目说明、本地运行、部署步骤、环境变量说明
- 可选：ESLint + 基础 CI（GitHub Actions 构建校验）

## 7. 部署流程

1. Supabase 建项目 → 执行 `schema.sql` + `seed.sql`
2. 后端改造完成 → 推送到仓库 → Vercel 导入部署（根目录依赖清单 + vercel.json）
3. 前端 `npm run build` → GitHub Pages（base 设为 `/virtual-product/`，参照既有 Kam-Blog 经验：仓库改名/子路径时 base 必须同步）
4. `.env.example` 提供模板；真实密钥只配置在部署平台环境变量

## 8. 上线前优化清单（优先级）

| 优先级 | 事项 |
|---|---|
| P0 | 密码加密 + JWT、越权修复、.env 移出仓库、上传安全 |
| P0 | 购物车接口修复、checkout 重写、订单 + 模拟支付闭环 |
| P0 | 数据库重建 + 种子数据、静态数据兜底 |
| P1 | 管理后台、路由守卫、搜索补全 |
| P1 | Element Plus 按需、图片压缩、README/文档/CI |

## 9. 验收标准

- 新环境执行 schema.sql + seed.sql 后，注册/登录/浏览商品/加购/结算/模拟支付/查看交付内容全链路可用
- 停掉后端服务后，首页与商品详情仍可浏览并标注"演示数据"，不可下单
- 越权验证：登录 A 用户无法通过修改参数操作 B 用户购物车/订单
- 构建产物主包 gzip ≤ 300KB；GitHub Pages 访问路径正常（含子路径 base）
- 仓库内不再出现 .env 及明文密码/敏感日志
