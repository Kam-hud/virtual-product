import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api/index'
import { useUserStore } from './user'

export const useCartStore = defineStore('cart', () => {
    const cartItems = ref([])
    const userStore = useUserStore()
    const isloading = ref(true)
    const error = ref(null)

    const loadCart = async () => {
        if (!userStore.isLoggedIn || !userStore.currentUser) return
        isloading.value = true
        error.value = null

        try {
            const req = await api.get(`/cart/${userStore.currentUser.id}`)
            cartItems.value = req.data.map(item => ({
                ...item,
                selected: true
            }))
        } catch (error) {
            console.error('加载购物车失败:', error)
            ElMessage.error('加载购物车失败')
        }
    }

    // 添加商品到购物车
    // const addItem = (product, quantity = 1) => {
    //     const existingItem = cartItems.value.find(item => item.id === product.id)

    //     // 检查购物车是否已存在该商品，有商品就增加数量
    //     if (existingItem) {
    //         existingItem.quantity += quantity
    //     } else {
    //         cartItems.value.push({
    //             ...product,
    //             quantity,
    //             selected: true
    //         })
    //     }
    // }

    // 添加商品到购物车
    const addItem = async (product, quantity = 1) => {

        if (!userStore.isLoggedIn) {
            ElMessage.error('请先登录')
            return
        }

        try {
            const req = await api.post('/cart', {
                userId: userStore.currentUser.id,
                productId: product.id,
                quantity
            })
            cartItems.value.push(req.data)
        } catch (error) {
            console.error('添加到购物车失败:', error)
            ElMessage.error('添加到购物车失败')
        }
    }

    // 移除商品
    const removeItem = async (cartId) => {
        // cartItems.value = cartItems.value.filter(item => item.id !== produtId)
        try {
            await api.delete(`/cart/${cartId}`)
            // 更新本地状态
            cartItems.value = cartItems.value.filter(item => item.id !== cartId)
            ElMessage.success('商品已移除')
        } catch (error) {
            console.error('移除商品失败:', error)
            ElMessage.error('移除商品失败')
        }
    }

    // 更新商品数量
    const updateQuantity = async (cartId, newQuantity) => {
        // const item = cartItems.value.find(item => item.id === productId)
        // if (item) {
        //     item.quantity = Math.max(1, newQuantity)
        // }
        try {
            await api.put(`/cart/${cartId}`, { quantity: newQuantity })
            // 更新本地状态
            const item = cartItems.value.find(item => item.id === cartId)
            if (item) {
                item.quantity = Math.max(1, newQuantity)
            }
        } catch (error) {
            console.error('更新数量失败:', error)
            ElMessage.error('更新数量失败')
        }
    }

    // 清空购物车
    const clearCart = async () => {
        // cartItems.value = []
        if (!userStore.isLoggedIn) return

        try {
            await api.delete(`/cart/user/${userStore.currentUser.id}`)
            cartItems.value = []
            ElMessage.success('购物车已清空')
        } catch (error) {
            console.error('清空购物车失败:', error)
            ElMessage.error('清空购物车失败')
        }
    }

    // 切换商品选中状态
    const toggleSelection = async (cartId) => {
        // const item = cartItems.value.find(item => item.id === productId)
        // if (item) return item.selected = !item.selected
        const item = cartItems.value.find(item => item.id === cartId)
        if (item) {
            const newSelected = !item.selected
            item.selected = newSelected

            try {
                await api.put(`/cart/${cartId}/selection`, { selected: newSelected })
            } catch (error) {
                console.error('更新选中状态失败:', error)
                // 回滚选中状态
                item.selected = !newSelected
                ElMessage.error('更新选中状态失败')
            }
        }
    }

    // 全选/取消全选
    const toggleAllSelection = async (selected) => {
        // cartItems.value.forEach(item => {
        //     item.selected = selected
        // })
        cartItems.value.forEach(item => {
            item.selected = selected
        })

        try {
            await api.put(`/cart/user/${userStore.currentUser.id}/selection`, { selected })
        } catch (error) {
            console.error('更新全选状态失败:', error)
            ElMessage.error('更新全选状态失败')
        }
    }

    // 计算总价
    const totalPrice = computed(() => {
        return cartItems.value.filter(item => item.selected).reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)
    })

    // 选中商品数量
    const selectedCount = computed(() => {
        return cartItems.value.reduce((total, item) => total + (item.selected ? item.quantity : 0), 0)
    })

    // 购物车商品总数
    const totalCount = computed(() => {
        return cartItems.value.reduce((total, item) => total + item.quantity, 0)
    })

    return {
        cartItems,
        loadCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleSelection,
        toggleAllSelection,
        totalPrice,
        selectedCount,
        totalCount
    }
})