import axios from 'axios'

// 后端基础地址：优先取构建环境变量，开发环境走 Vite 代理 /api
const baseURL = import.meta.env.VITE_API_BASE || '/api'

const api = axios.create({
    baseURL,
    timeout: 10000,
})

// 请求拦截器：自动携带 JWT
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// 响应拦截器：统一错误提示与 401 处理
api.interceptors.response.use(
    (res) => res,
    (error) => {
        const status = error.response?.status
        const message = error.response?.data?.message || '网络请求失败'
        if (status === 401 && !location.pathname.startsWith('/login')) {
            localStorage.removeItem('token')
            localStorage.removeItem('currentUser')
            // 使用 BASE_URL 保证 GitHub Pages 子路径部署时跳转正确
            location.href = import.meta.env.BASE_URL + 'login'
        }
        return Promise.reject(new Error(message))
    }
)

export default api
