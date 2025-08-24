import express from 'express'
import mysql from 'mysql2/promise'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'
import fs from 'fs'

// 解决 __dirname 在 ES 模块中的问题
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 加载环境变量
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const app = express()
const PORT = process.env.SERVER_PORT || 3001

// 创建数据库连接池
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'virtual_store',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
})

// 测试数据库连接
async function testDbConnection() {
    try {
        const connection = await pool.getConnection()
        console.log('✅ 成功连接到数据库')
        connection.release()
    } catch (error) {
        console.error('❌ 数据库连接失败:', error.message)
        process.exit(1)
    }
}

// 确保上传目录存在
const uploadDir = path.resolve(process.cwd(), 'uploads')
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir)
    console.log('📁 创建上传目录: ', uploadDir)
}

// 配置文件上传
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    },
})

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
})

// CORS 配置
const corsOptions = {
    origin: 'http://localhost:5173', // 前端开发地址
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200,
}

// 中间件
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 提供静态文件服务
app.use('/uploads', express.static(uploadDir))

// 用户注册接口
app.post('/api/register', upload.single('avatar'), async (req, res) => {
    const { username, email, password } = req.body
    const avatarFile = req.file

    // 验证必填字段
    if (!username || !email || !password) {
        return res.status(400).json({ message: '请提供完整的注册信息' })
    }

    try {
        console.log('---------------- 注册请求开始 ----------------')
        console.log('注册信息:', {
            username,
            email,
            password: `[${password}]`,
            passwordLength: password.length,
        })

        // 检查邮箱是否已存在
        const [existing] = await pool.query('SELECT * FROM users WHERE email = ? OR username = ?', [
            email,
            username,
        ])

        if (existing.length > 0) {
            console.log('❌ 用户名或邮箱已被使用')
            return res.status(400).json({ message: '用户名或邮箱已被使用' })
        }

        // 处理头像路径
        let avatarPath = null
        if (avatarFile) {
            avatarPath = `/uploads/${avatarFile.filename}`
        }

        // 创建用户
        const [result] = await pool.query(
            `INSERT INTO users 
             (username, email, password, avatar) 
             VALUES (?, ?, ?, ?)`,
            [username, email, password, avatarPath],
        )

        console.log('✅ 注册成功，用户ID:', result.insertId)
        console.log('---------------- 注册结束 ----------------')

        res.status(201).json({
            message: '注册成功',
            userId: result.insertId,
        })
    } catch (error) {
        console.error('❌ 注册错误:', error)
        res.status(500).json({
            message: '服务器内部错误',
            error: error.message,
            sql: error.sql,
        })
    }
})

// 用户登录接口
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ message: '请提供邮箱和密码' })
    }

    try {
        console.log('---------------- 登录请求开始 ----------------')
        console.log('接收到的邮箱:', email)
        console.log('接收到的密码:', password)

        // 清理邮箱格式
        const cleanEmail = email.trim().toLowerCase()
        console.log('清理后的邮箱:', cleanEmail)

        // 查找用户
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [cleanEmail])

        console.log('查询结果数量:', users.length)

        if (users.length === 0) {
            console.log('❌ 未找到用户')
            return res.status(401).json({ message: '邮箱或密码错误' })
        }

        const user = users[0]
        console.log('数据库中的用户:', {
            id: user.id,
            username: user.username,
            email: user.email,
            password: user.password,
            avatar: user.avatar,
        })

        // 验证密码 - 添加trim处理
        const cleanInputPassword = password.trim()
        const cleanDBPassword = user.password.trim()
        const validPassword = cleanInputPassword === cleanDBPassword

        console.log('密码验证结果:', validPassword ? '✅ 成功' : '❌ 失败')
        console.log(`输入密码: "${cleanInputPassword}" (长度: ${cleanInputPassword.length})`)
        console.log(`数据库密码: "${cleanDBPassword}" (长度: ${cleanDBPassword.length})`)

        if (!validPassword) {
            console.log('❌ 密码不匹配')
            return res.status(401).json({
                message: '邮箱或密码错误',
                debug: {
                    inputLength: cleanInputPassword.length,
                    dbLength: cleanDBPassword.length,
                },
            })
        }

        // 返回用户信息（排除密码）
        const { password: _, ...userData } = user
        console.log('---------------- 登录成功 ----------------')

        // 确保发送响应
        res.json(userData)
    } catch (error) {
        console.error('❌ 登录错误:', error)

        // 确保发送错误响应
        res.status(500).json({
            message: '服务器内部错误',
            error: error.message,
        })
    }
})

// 获取所有商品接口
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM product')
        res.json(rows)
    } catch (error) {
        console.error('❌ 获取商品错误:', error)
        res.status(500).json({
            message: '服务器内部错误',
        })
    }
})

// 获取商品详情接口
app.get('/api/products/:id', async (req, res) => {
    const productId = req.params.id
    try {
        const [rows] = await pool.query('SELECT * FROM product WHERE id = ?', [productId])
        if (rows.length === 0) {
            return res.status(404).json({ message: '商品不存在' })
        }
        res.json(rows[0])
    } catch (error) {
        console.error('❌ 获取商品详情错误:', error)
        res.status(500).json({
            message: '服务器内部错误',
        })
    }
})

// 获取用户购物车接口
app.get('/api/cart/:userId', async (req, res) => {
    const userId = req.params.userId
    try {
        const [rows] = await pool.query(
            `
            SELECT 
                cart.*, 
                product.name, 
                product.image, 
                product.price, 
                product.originalPrice,
                product.tag,
                product.description,
                product.details
            FROM cart
            LEFT JOIN product ON cart.product_id = product.id
            WHERE cart.user_id = ?
            `,
            [userId],
        )
        res.json(rows)
    } catch (error) {
        console.error('❌ 获取购物车错误:', error)
        res.status(500).json({
            message: '服务器内部错误',
        })
    }
})

// 添加商品到购物车接口
app.post('/api/cart', async (req, res) => {
    const { userId, productId, quantity } = req.body

    if (!userId || !productId || !quantity) {
        return res.status(400).json({ message: '请提供用户ID、商品ID和数量' })
    }

    try {
        const [existing] = await pool.query('SELECT * FROM cart WHERE user_id = ? AND product_id = ?', [
            userId,
            productId,
        ])

        if (existing.length > 0) {
            const newQuantity = existing[0].quantity + quantity
            await pool.query('UPDATE cart SET quantity = ? WHERE id = ?', [newQuantity, existing[0].id])
            res.json({ message: '购物车已更新', cartId: existing[0].id })
        } else {
            const [result] = await pool.query(
                'INSERT INTO cart (user_id, product_id, quantity,selected) VALUES (?, ?, ?,?)',
                [userId, productId, quantity, true],
            )
            res.status(201).json({ message: '已添加到购物车', cartId: result.insertId })
        }
    } catch (error) {
        console.error('❌ 添加到购物车错误:', error)
        res.status(500).json({
            message: '服务器内部错误',
        })
    }
})

// 更新购物车商品数量
app.put('/api/cart/:cartId', async (req, res) => {
    const cartId = req.params.cartId
    const { quantity } = req.body

    try {
        await pool.query('UPDATE cart SET quantity = ? WHERE id = ?', [quantity, cartId])
        res.json({ message: '购物车已更新' })
    } catch (error) {
        console.error('❌ 更新购物车错误:', error)
        res.status(500).json({
            message: '服务器内部错误',
        })
    }
})

// 删除购物车商品接口
app.delete('/api/cart/:cartId', async (req, res) => {
    const cartId = req.params.cartId
    try {
        await pool.query('DELETE FROM cart WHERE id = ?', [cartId])
        res.json({ message: '购物车已删除' })
    } catch (error) {
        console.error('❌ 删除购物车错误:', error)
        res.status(500).json({
            message: '服务器内部错误',
        })
    }
})

// 清空购物车接口
app.delete('/api/cart/:userId', async (req, res) => {
    const userId = req.params.userId
    try {
        await pool.query('DELETE FROM cart WHERE user_id = ?', [userId])
        res.json({ message: '购物车已清空' })
    } catch (error) {
        console.error('❌ 清空购物车错误:', error)
        res.status(500).json({
            message: '服务器内部错误',
        })
    }
})

// 切换购物车商品选中状态
app.put('/api/cart/:cartId', async (req, res) => {
    const cartId = req.params.cartId
    const { selected } = req.body
    try {
        await pool.query('UPDATE cart SET selected = ? WHERE id = ?', [selected, cartId])
        res.json({ message: '购物车已更新' })
    } catch (error) {
        console.error('❌ 更新购物车错误:', error)
        res.status(500).json({
            message: '服务器内部错误',
        })
    }
})

// 更新购物车全选状态
app.put('/api/cart/user/:userId/selection', async (req, res) => {
    const userId = req.params.userId
    const { selected } = req.body
    try {
        await pool.query('UPDATE cart SET selected = ? WHERE user_id = ?', [selected, userId])
        res.json({ message: '购物车已更新' })
    } catch (error) {
        console.error('❌ 更新购物车错误:', error)
        res.status(500).json({
            message: '服务器内部错误',
        })
    }
})

// 健康检查端点
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: 'connected',
        uploadDir: uploadDir,
        serverPort: PORT,
        dbHost: process.env.DB_HOST,
    })
})

// 处理未匹配的路由
app.use((req, res) => {
    res.status(404).json({
        message: '路由不存在',
        requestedUrl: req.originalUrl,
    })
})

// 全局错误处理
app.use((err, req, res, next) => {
    console.error('全局错误:', err.stack)

    // Multer 文件上传错误处理
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            error: '文件上传错误',
            message: err.message,
        })
    }

    res.status(500).json({
        error: '服务器内部错误',
        message: err.message || '未知错误',
    })
})

// 启动服务器
app.listen(PORT, async () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`)
    console.log(`📁 文件上传目录: ${uploadDir}`)
    console.log(`🌐 CORS 允许的源: http://localhost:5173`)

    await testDbConnection()
})
