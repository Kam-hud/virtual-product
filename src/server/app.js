import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { pool, query, testDbConnection } from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const JWT_SECRET = process.env.JWT_SECRET || 'virtual-store-dev-secret-change-me'
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d'
const UPLOAD_LIMIT_MB = 5

// 上传：本地写盘，Serverless 环境降级为忽略文件（注册仍可用默认头像）
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: UPLOAD_LIMIT_MB * 1024 * 1024 },
    fileFilter(req, file, cb) {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error('仅支持 JPG/PNG/GIF/WEBP 图片'))
        }
        cb(null, true)
    },
})

export function createApp() {
    const app = express()
    const isServerless = !!process.env.VERCEL

    const corsOptions = {
        origin: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:4173').split(',').map((s) => s.trim()),
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        optionsSuccessStatus: 200,
    }
    app.use(cors(corsOptions))
    app.use(express.json({ limit: '2mb' }))
    app.use(express.urlencoded({ extended: true, limit: '2mb' }))

    // 本地静态上传目录
    if (!isServerless) {
        const uploadDir = path.resolve(process.cwd(), 'uploads')
        app.use('/uploads', express.static(uploadDir))
    }

    // 认证中间件：解析 Bearer Token
    function auth(req, res, next) {
        const header = req.headers.authorization || ''
        const token = header.startsWith('Bearer ') ? header.slice(7) : null
        if (!token) return res.status(401).json({ message: '未登录，请先登录' })
        try {
            req.user = jwt.verify(token, JWT_SECRET)
            next()
        } catch (e) {
            return res.status(401).json({ message: '登录已过期，请重新登录' })
        }
    }

    function requireAdmin(req, res, next) {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: '无管理员权限' })
        }
        next()
    }

    // 通用异步错误包装
    const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

    // ---------------- 公共接口 ----------------

    app.get('/api/health', wrap(async (req, res) => {
        const dbNow = await testDbConnection()
        res.json({ status: 'OK', timestamp: new Date().toISOString(), database: 'connected', time: dbNow })
    }))

    // 分类列表
    app.get('/api/categories', wrap(async (req, res) => {
        const { rows } = await query('SELECT id, name, icon FROM category ORDER BY sort ASC')
        res.json(rows)
    }))

    // 商品列表（支持 ?category= 与 ?q= 搜索）
    app.get('/api/products', wrap(async (req, res) => {
        const { category, q } = req.query
        const conditions = ["status = 'on'"]
        const params = []
        if (category && category !== 'all') {
            params.push(category)
            conditions.push(`category_id = $${params.length}`)
        }
        if (q) {
            params.push(`%${q}%`)
            conditions.push(`name ILIKE $${params.length}`)
        }
        const { rows } = await query(
            `SELECT id, name, description, details, price, original_price AS "originalPrice", image, category_id AS "categoryId", tag, sales, rating, delivery_content AS "deliveryContent"
             FROM product WHERE ${conditions.join(' AND ')} ORDER BY sales DESC`,
            params
        )
        res.json(rows)
    }))

    // 商品详情
    app.get('/api/products/:id', wrap(async (req, res) => {
        const { rows } = await query(
            `SELECT id, name, description, details, price, original_price AS "originalPrice", image, category_id AS "categoryId", tag, sales, rating, delivery_content AS "deliveryContent"
             FROM product WHERE id = $1`,
            [req.params.id]
        )
        if (rows.length === 0) return res.status(404).json({ message: '商品不存在' })
        res.json(rows[0])
    }))

    // ---------------- 认证接口 ----------------

    app.post('/api/register', upload.single('avatar'), wrap(async (req, res) => {
        const { username, email, password } = req.body
        if (!username || !email || !password) return res.status(400).json({ message: '请提供完整的注册信息' })
        if (password.length < 6) return res.status(400).json({ message: '密码长度至少为 6 位' })

        const { rows: existing } = await query('SELECT id FROM users WHERE email = $1 OR username = $2', [email, username])
        if (existing.length > 0) return res.status(400).json({ message: '用户名或邮箱已被使用' })

        const passwordHash = await bcrypt.hash(password, 10)
        let avatar = 'images/products/logo.png'
        if (!isServerless && req.file && req.file.buffer) {
            const fs = await import('fs')
            const uploadDir = path.resolve(process.cwd(), 'uploads')
            fs.mkdirSync(uploadDir, { recursive: true })
            const filename = `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(req.file.originalname || '.png')}`
            fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer)
            avatar = `/uploads/${filename}`
        }

        const { rows: created } = await query(
            'INSERT INTO users (username, email, password_hash, avatar, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, avatar, role',
            [username, email, passwordHash, avatar, 'user']
        )
        res.status(201).json({ message: '注册成功', user: created[0] })
    }))

    app.post('/api/login', wrap(async (req, res) => {
        const { email, password } = req.body
        if (!email || !password) return res.status(400).json({ message: '请提供邮箱和密码' })

        const { rows } = await query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()])
        if (rows.length === 0) return res.status(401).json({ message: '邮箱或密码错误' })

        const user = rows[0]
        const valid = await bcrypt.compare(password, user.password_hash)
        if (!valid) return res.status(401).json({ message: '邮箱或密码错误' })

        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES }
        )
        res.json({
            token,
            user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar, role: user.role },
        })
    }))

    app.get('/api/me', auth, wrap(async (req, res) => {
        const { rows } = await query('SELECT id, username, email, avatar, role FROM users WHERE id = $1', [req.user.id])
        if (rows.length === 0) return res.status(404).json({ message: '用户不存在' })
        res.json(rows[0])
    }))

    // ---------------- 购物车接口（基于 JWT，修复 IDOR） ----------------

    app.get('/api/cart', auth, wrap(async (req, res) => {
        const { rows } = await query(
            `SELECT c.id, c.product_id AS "productId", c.quantity, c.selected,
                    p.name, p.image, p.price, p.original_price AS "originalPrice", p.tag, p.description
             FROM cart c JOIN product p ON c.product_id = p.id
             WHERE c.user_id = $1 ORDER BY c.created_at DESC`,
            [req.user.id]
        )
        res.json(rows)
    }))

    app.post('/api/cart', auth, wrap(async (req, res) => {
        const { productId, quantity = 1 } = req.body
        if (!productId) return res.status(400).json({ message: '请提供商品 ID' })
        const qty = Math.max(1, parseInt(quantity, 10) || 1)

        const { rows: existing } = await query('SELECT id, quantity FROM cart WHERE user_id = $1 AND product_id = $2', [
            req.user.id,
            productId,
        ])
        if (existing.length > 0) {
            const newQty = existing[0].quantity + qty
            await query('UPDATE cart SET quantity = $1 WHERE id = $2', [newQty, existing[0].id])
            return res.json({ message: '购物车已更新', cartId: existing[0].id, quantity: newQty })
        }
        const { rows } = await query(
            'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING id',
            [req.user.id, productId, qty]
        )
        res.status(201).json({ message: '已添加到购物车', cartId: rows[0].id })
    }))

    app.put('/api/cart/:cartId', auth, wrap(async (req, res) => {
        const { quantity } = req.body
        if (!quantity) return res.status(400).json({ message: '请提供数量' })
        const qty = Math.max(1, parseInt(quantity, 10) || 1)
        const { rowCount } = await query(
            'UPDATE cart SET quantity = $1 WHERE id = $2 AND user_id = $3',
            [qty, req.params.cartId, req.user.id]
        )
        if (rowCount === 0) return res.status(404).json({ message: '购物车项不存在' })
        res.json({ message: '购物车已更新' })
    }))

    app.put('/api/cart/:cartId/selection', auth, wrap(async (req, res) => {
        const { selected } = req.body
        await query('UPDATE cart SET selected = $1 WHERE id = $2 AND user_id = $3', [
            selected === true,
            req.params.cartId,
            req.user.id,
        ])
        res.json({ message: '购物车已更新' })
    }))

    app.put('/api/cart/selection/all', auth, wrap(async (req, res) => {
        const { selected } = req.body
        await query('UPDATE cart SET selected = $1 WHERE user_id = $2', [selected === true, req.user.id])
        res.json({ message: '购物车已更新' })
    }))

    app.delete('/api/cart/:cartId', auth, wrap(async (req, res) => {
        const { rowCount } = await query('DELETE FROM cart WHERE id = $1 AND user_id = $2', [
            req.params.cartId,
            req.user.id,
        ])
        if (rowCount === 0) return res.status(404).json({ message: '购物车项不存在' })
        res.json({ message: '购物车已删除' })
    }))

    app.delete('/api/cart', auth, wrap(async (req, res) => {
        await query('DELETE FROM cart WHERE user_id = $1', [req.user.id])
        res.json({ message: '购物车已清空' })
    }))

    // ---------------- 订单接口（下单 + 模拟支付闭环） ----------------

    app.post('/api/orders', auth, wrap(async (req, res) => {
        const { paymentMethod = 'mock', discountAmount = 0 } = req.body
        const { rows: items } = await query(
            `SELECT c.product_id AS "productId", c.quantity, p.name, p.image, p.price, p.delivery_content AS "deliveryContent"
             FROM cart c JOIN product p ON c.product_id = p.id
             WHERE c.user_id = $1 AND c.selected = TRUE`,
            [req.user.id]
        )
        if (items.length === 0) return res.status(400).json({ message: '没有选中的商品' })

        const total = items.reduce((sum, it) => sum + Number(it.price) * it.quantity, 0)
        const discount = Math.max(0, Math.min(Number(discountAmount) || 0, total))
        const orderNo = 'VS' + Date.now() + Math.random().toString(36).slice(2, 6).toUpperCase()

        const client = await pool.connect()
        try {
            await client.query('BEGIN')
            const { rows: orderRows } = await client.query(
                `INSERT INTO orders (order_no, user_id, total_amount, discount_amount, status, payment_method)
                 VALUES ($1, $2, $3, $4, 'pending', $5) RETURNING id, order_no`,
                [orderNo, req.user.id, total.toFixed(2), discount.toFixed(2), paymentMethod]
            )
            const orderId = orderRows[0].id
            for (const it of items) {
                await client.query(
                    `INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, delivery_content)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [orderId, it.productId, it.name, it.image, it.price, it.quantity, it.deliveryContent]
                )
            }
            await client.query('DELETE FROM cart WHERE user_id = $1 AND selected = TRUE', [req.user.id])
            await client.query('COMMIT')
            res.status(201).json({ orderId, orderNo, totalAmount: total.toFixed(2), discountAmount: discount.toFixed(2) })
        } catch (e) {
            await client.query('ROLLBACK')
            throw e
        } finally {
            client.release()
        }
    }))

    // 模拟支付：直接置为 paid，返回交付内容
    app.post('/api/orders/:id/pay', auth, wrap(async (req, res) => {
        const { rows } = await query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id])
        if (rows.length === 0) return res.status(404).json({ message: '订单不存在' })
        const order = rows[0]
        if (order.status === 'paid') {
            return res.json({ message: '订单已支付', order })
        }

        const { rows: paid } = await query(
            `UPDATE orders SET status = 'paid', paid_at = NOW() WHERE id = $1 RETURNING id, order_no, status, paid_at`,
            [order.id]
        )
        const { rows: items } = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id])

        // 模拟交付：更新销量
        for (const it of items) {
            await query('UPDATE product SET sales = sales + $1 WHERE id = $2', [it.quantity, it.product_id])
        }

        res.json({
            message: '支付成功（模拟）',
            order: paid[0],
            delivery: items.map((it) => ({ name: it.product_name, deliveryContent: it.delivery_content })),
        })
    }))

    app.get('/api/orders', auth, wrap(async (req, res) => {
        const { rows } = await query(
            `SELECT id, order_no AS "orderNo", total_amount AS "totalAmount", discount_amount AS "discountAmount",
                    status, payment_method AS "paymentMethod", created_at AS "createdAt", paid_at AS "paidAt"
             FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
            [req.user.id]
        )
        res.json(rows)
    }))

    app.get('/api/orders/:id', auth, wrap(async (req, res) => {
        const { rows } = await query(
            `SELECT id, order_no AS "orderNo", total_amount AS "totalAmount", discount_amount AS "discountAmount",
                    status, payment_method AS "paymentMethod", created_at AS "createdAt", paid_at AS "paidAt"
             FROM orders WHERE id = $1 AND user_id = $2`,
            [req.params.id, req.user.id]
        )
        if (rows.length === 0) return res.status(404).json({ message: '订单不存在' })
        const { rows: items } = await query(
            `SELECT product_name AS "productName", product_image AS "productImage", price, quantity, delivery_content AS "deliveryContent"
             FROM order_items WHERE order_id = $1`,
            [req.params.id]
        )
        res.json({ ...rows[0], items })
    }))

    // ---------------- 管理后台接口 ----------------

    app.get('/api/admin/stats', auth, requireAdmin, wrap(async (req, res) => {
        const users = await query('SELECT COUNT(*) AS total FROM users')
        const products = await query('SELECT COUNT(*) AS total FROM product')
        const orders = await query('SELECT COUNT(*) AS total FROM orders')
        const revenue = await query("SELECT COALESCE(SUM(total_amount - discount_amount), 0) AS total FROM orders WHERE status = 'paid'")
        res.json({
            users: users.rows[0].total,
            products: products.rows[0].total,
            orders: orders.rows[0].total,
            revenue: revenue.rows[0].total,
        })
    }))

    app.get('/api/admin/orders', auth, requireAdmin, wrap(async (req, res) => {
        const { rows } = await query(
            `SELECT o.id, o.order_no AS "orderNo", o.total_amount AS "totalAmount", o.discount_amount AS "discountAmount",
                    o.status, o.payment_method AS "paymentMethod", o.created_at AS "createdAt", u.username
             FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 200`
        )
        res.json(rows)
    }))

    app.get('/api/admin/products', auth, requireAdmin, wrap(async (req, res) => {
        const { rows } = await query(
            `SELECT id, name, price, original_price AS "originalPrice", category_id AS "categoryId", status, sales, image
             FROM product ORDER BY id ASC`
        )
        res.json(rows)
    }))

    app.put('/api/admin/products/:id', auth, requireAdmin, wrap(async (req, res) => {
        const { name, price, status, categoryId } = req.body
        await query(
            `UPDATE product SET name = COALESCE($1, name), price = COALESCE($2, price),
             status = COALESCE($3, status), category_id = COALESCE($4, category_id) WHERE id = $5`,
            [name, price, status, categoryId, req.params.id]
        )
        res.json({ message: '商品已更新' })
    }))

    // 404
    app.use((req, res) => {
        res.status(404).json({ message: '路由不存在', requestedUrl: req.originalUrl })
    })

    // 全局错误处理
    // eslint-disable-next-line no-unused-vars
    app.use((err, req, res, next) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: '文件上传错误: ' + err.message })
        }
        if (err && err.message && err.message.includes('仅支持')) {
            return res.status(400).json({ message: err.message })
        }
        console.error('全局错误:', err)
        res.status(500).json({ message: '服务器内部错误', error: err.message })
    })

    return app
}
