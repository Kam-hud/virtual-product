import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import dotenv from 'dotenv'
import { createApp } from './app.js'
import { testDbConnection } from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const PORT = process.env.SERVER_PORT || 3001

// 确保本地上传目录存在
const uploadDir = path.resolve(process.cwd(), 'uploads')
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

const app = createApp()

app.listen(PORT, async () => {
    console.log(`🚀 VirtualStore 服务器运行在 http://localhost:${PORT}`)
    try {
        const now = await testDbConnection()
        console.log(`✅ 数据库连接成功: ${now}`)
    } catch (e) {
        console.error('❌ 数据库连接失败:', e.message)
        console.error('请检查 DATABASE_URL 或 DB_* 环境变量配置')
    }
})
