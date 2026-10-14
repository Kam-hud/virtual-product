import pg from 'pg'

// PostgreSQL 连接池：优先使用 DATABASE_URL（Supabase 连接串），否则使用独立字段
const { Pool } = pg

const connectionConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT, 10) || 5432,
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_NAME || 'virtual_store',
      }

export const pool = new Pool({
    ...connectionConfig,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
})

export async function query(text, params) {
    return pool.query(text, params)
}

export async function testDbConnection() {
    const res = await pool.query('SELECT NOW() AS now')
    return res.rows[0].now
}
