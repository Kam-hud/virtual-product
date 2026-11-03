// EdgeOne Pages Node Function 入口：导出 Express app 实例，匹配所有 /api/* 请求
// 与 Vercel 入口（api/index.js）复用同一份 app 逻辑，实现双平台兼容
import { createApp } from '../../src/server/app.js'

const app = createApp()

export default app