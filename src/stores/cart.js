import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api/index'
import { useUserStore } from './user'
import { resolveImage } from '@/utils/image'

export const useCartStore = defineStore('cart', () => {
    const cartItems = ref([])
    const userStore = useUserStore()
    const isloading = ref(true)
    const error = ref(null)

    const loadCart = async () => {
        if (!userStore.isLoggedIn) return
        isloading.value = true
        error.value = null

        try {
            const req = await api.get('/cart')
            cartItems.value = req.data.map((item) => ({
                id: item.id,
                productId: item.productId,
                quantity: item.quantity,
                selected: item.selected !== false,
                name: item.name,
                image: resolveImage(item.image),
                price: Number(item.price),
                tag: item.tag,
                originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
            }))
        } catch (e) {
            console.error('加载购物车失败:', e)
            error.value = e.message
        } finally {
            isloading.value = false
        }
    }

    const addItem = async (product, quantity = 1) => {
        if (!userStore.isLoggedIn) {
            ElMessage.error('请先登录')
            return
        }
        try {
            await api.post('/cart', { productId: product.id, quantity })
            ElMessage.success('已添加到购物车')
            await loadCart()
        } catch (e) {
            console.error('添加到购物车失败:', e)
            ElMessage.error(e.message || '添加到购物车失败')
        }
    }

    const removeItem = async (cartId) => {
        try {
            await api.delete(`/cart/${cartId}`)
            cartItems.value = cartItems.value.filter((item) => item.id !== cartId)
            ElMessage.success('商品已移除')
        } catch (e) {
            console.error('移除商品失败:', e)
            ElMessage.error(e.message || '移除商品失败')
        }
    }

    const updateQuantity = async (cartId, newQuantity) => {
        try {
            await api.put(`/cart/${cartId}`, { quantity: newQuantity })
            const item = cartItems.value.find((item) => item.id === cartId)
            if (item) item.quantity = Math.max(1, newQuantity)
        } catch (e) {
            console.error('更新数量失败:', e)
            ElMessage.error(e.message || '更新数量失败')
        }
    }

    const clearCart = async () => {
        if (!userStore.isLoggedIn) return
        try {
            await api.delete('/cart')
            cartItems.value = []
            ElMessage.success('购物车已清空')
        } catch (e) {
            console.error('清空购物车失败:', e)
            ElMessage.error(e.message || '清空购物车失败')
        }
    }

    const toggleSelection = async (cartId) => {
        const item = cartItems.value.find((item) => item.id === cartId)
        if (!item) return
        const newSelected = !item.selected
        item.selected = newSelected
        try {
            await api.put(`/cart/${cartId}/selection`, { selected: newSelected })
        } catch (e) {
            console.error('更新选中状态失败:', e)
            item.selected = !newSelected
            ElMessage.error(e.message || '更新选中状态失败')
        }
    }

    const toggleAllSelection = async (selected) => {
        cartItems.value.forEach((item) => {
            item.selected = selected
        })
        try {
            await api.put('/cart/selection/all', { selected })
        } catch (e) {
            console.error('更新全选状态失败:', e)
            ElMessage.error(e.message || '更新全选状态失败')
        }
    }

    const totalPrice = computed(() => {
        return cartItems.value
            .filter((item) => item.selected)
            .reduce((total, item) => total + item.price * item.quantity, 0)
            .toFixed(2)
    })

    const selectedCount = computed(() => {
        return cartItems.value.reduce((total, item) => total + (item.selected ? item.quantity : 0), 0)
    })

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
        totalCount,
    }
})
