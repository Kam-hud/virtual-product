// 用户模块：JWT + 角色管理
import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import { useCartStore } from './cart'
import { resolveImage } from '@/utils/image'

export const useUserStore = defineStore('user', {
    state: () => ({
        currentUser: null,
        token: localStorage.getItem('token') || '',
    }),

    actions: {
        initialize() {
            const user = localStorage.getItem('currentUser')
            if (user) {
                this.currentUser = JSON.parse(user)
                const cartStore = useCartStore()
                cartStore.loadCart()
            }
        },

        setAuth(token, user) {
            this.token = token
            this.currentUser = {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar: resolveImage(user.avatar) || this.getDefaultAvatar(),
                role: user.role || 'user',
            }
            localStorage.setItem('token', token)
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser))

            const cartStore = useCartStore()
            cartStore.loadCart()
        },

        Login(userInfo) {
            // 兼容旧调用：直接传入登录响应
            if (userInfo && userInfo.token) {
                this.setAuth(userInfo.token, userInfo.user)
            } else {
                this.currentUser = {
                    id: userInfo.id,
                    username: userInfo.username,
                    email: userInfo.email,
                    avatar: resolveImage(userInfo.avatar) || this.getDefaultAvatar(),
                    role: userInfo.role || 'user',
                }
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser))
                const cartStore = useCartStore()
                cartStore.loadCart()
            }
            ElMessage.success('登录成功')
        },

        logout() {
            const cartStore = useCartStore()
            cartStore.clearCart()
            localStorage.removeItem('token')
            localStorage.removeItem('currentUser')
            this.token = ''
            this.currentUser = null
            ElMessage.success('退出登录成功')
        },

        updateAvatar(avatarData) {
            if (this.currentUser) {
                this.currentUser.avatar = avatarData
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser))
            }
        },

        getDefaultAvatar() {
            return resolveImage('images/products/logo.png')
        },
    },

    getters: {
        isLoggedIn: (state) => !!state.token,
        username: (state) => state.currentUser?.username || '用户',
        email: (state) => state.currentUser?.email || '',
        isAdmin: (state) => state.currentUser?.role === 'admin',
        avatar(state) {
            return state.currentUser?.avatar || this.getDefaultAvatar()
        },
    },
})
