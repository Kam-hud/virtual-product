import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
    const cartItems = ref([])

    // 添加商品到购物车
    const addItem = (product, quantity = 1) => {
        const existingItem = cartItems.value.find(item => item.id === product.id)

        // 检查购物车是否已存在该商品，有商品就增加数量
        if (existingItem) {
            existingItem.quantity += quantity
        } else {
            cartItems.value.push({
                ...product,
                quantity,
                selected: true
            })
        }
    }

    // 移除商品
    const removeItem = (produtId) => {
        cartItems.value = cartItems.value.filter(item => item.id !== produtId)
    }

    // 更新商品数量
    const updateQuantity = (productId, newQuantity) => {
        const item = cartItems.value.find(item => item.id === productId)
        if (item) {
            item.quantity = Math.max(1, newQuantity)
        }
    }

    // 清空购物车
    const clearCart = () => {
        cartItems.value = []
    }

    // 切换商品选中状态
    const toggleSelection = (productId) => {
        const item = cartItems.value.find(item => item.id === productId)
        if (item) return item.selected = !item.selected
    }

    // 全选/取消全选
    const toggleAllSelection = (selected) => {
        cartItems.value.forEach(item => {
            item.selected = selected
        })
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