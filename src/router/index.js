import { createRouter, createWebHistory } from 'vue-router'

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
        component: () => import('@/views/CartView.vue')
    },
    {
        path: '/checkout',
        name: '结算',
        component: () => import('@/views/checkout.vue')
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
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        // 每次路由切换时都滚动到页面顶部
        return { top: 0 }
    }
})

export default router
