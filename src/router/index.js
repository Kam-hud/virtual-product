import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/home',
        name: '首页',
        component: () => import('@/views/HomeView.vue')
    },
    {
        path: '/product/:id',
        name: 'product',
        component: () => import('@/views/product.vue'),
        props: true
    },
    {
        path: '/cart',
        name: '购物车',
        component: () => import('@/views/CartView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/checkout',
        name: '结算',
        component: () => import('@/views/checkout.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/orders',
        name: '我的订单',
        component: () => import('@/views/orders.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/login',
        name: '登录',
        component: () => import('@/views/login.vue')
    },
    {
        path: '/register',
        name: '注册',
        component: () => import('@/views/register.vue')
    },
    {
        path: '/admin',
        name: '管理后台',
        component: () => import('@/views/admin.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
        // 每次路由切换时都滚动到页面顶部
        return { top: 0 }
    }
})

// 全局路由守卫：登录态 + 管理员权限
router.beforeEach((to, from, next) => {
    const userStore = useUserStore()

    if (to.meta.requiresAuth && !userStore.isLoggedIn) {
        next({ path: '/login', query: { redirect: to.fullPath } })
        return
    }

    if (to.meta.requiresAdmin && !userStore.isAdmin) {
        next('/home')
        return
    }

    // 已登录用户访问登录/注册页，直接回首页
    if ((to.path === '/login' || to.path === '/register') && userStore.isLoggedIn) {
        next('/home')
        return
    }

    next()
})

export default router
