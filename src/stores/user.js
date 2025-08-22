// 用户模块
import { defineStore } from "pinia";
import { ElMessage } from 'element-plus'
import { useCartStore } from './cart'

export const useUserStore = defineStore('user', {
    state: () => ({
        currentUser: null
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

        Login(userInfo) {
            this.currentUser = {
                id: userInfo.id,
                username: userInfo.username,
                email: userInfo.email,
                avatar: userInfo.avatar || this.getDefaultAvatar()
            }
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser))

            // 登录后加载购物车
            const cartStore = useCartStore()
            cartStore.loadCart()

            ElMessage.success('登录成功')
        },

        logout() {
            const cartStore = useCartStore()
            cartStore.clearCart()
            localStorage.removeItem('currentUser')
            this.currentUser = null
            ElMessage.success('退出登录成功')
        },

        updateAvatar(avatarData) {
            if (this.currentUser) {
                this.currentUser.avatar = avatarData
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser))

                const users = JSON.parse(localStorage.getItem('users')) || []
                const userIndex = users.findIndex(user => user.username === this.currentUser.username)
                if (userIndex !== -1) {
                    users[userIndex].avatar = avatarData
                    localStorage.setItem('users', JSON.stringify(users))
                }
            }
        },
        // 获取默认头像
        getDefaultAvatar() {
            return './assets/logo.png'
        }
    },

    getters: {
        isLoggedIn: (state) => state.currentUser !== null,
        username: (state) => state.currentUser?.username || '用户',
        email: (state) => state.currentUser?.email || '',
        avatar(state) {
            return state.currentUser?.avatar || this.getDefaultAvatar()
        }
    }
})