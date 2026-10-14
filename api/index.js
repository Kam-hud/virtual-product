// Vercel Serverless 入口：将 Express app 导出为 serverless function
import { createApp } from '../src/server/app.js'

const app = createApp()

export default app
