<script setup>
import { ShoppingCart } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted } from 'vue'


const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

onMounted(() => {
    if (userStore.isLoggedIn) {
        cartStore.loadCart()
    }
})
// 全选/取消全选
const allSelected = computed(() => {
    return cartStore.cartItems.length > 0 && cartStore.cartItems.every(item => item.selected)
})

const handleAllSelectionChange = (selected) => {
    cartStore.toggleAllSelection(selected)
}

// 移除商品
const removeItem = (item) => {
    cartStore.removeItem(item.id)
    ElMessage.success('商品已成功移除')
}

// 清空购物车
const clearCart = () => {
    ElMessageBox.confirm('确定要清空购物车吗', '提示', {
        confirmButtonText: '确定',
        confirmButtonText: '取消',
        type: 'warning'
    }).then(() => {
        cartStore.clearCart()
        ElMessage({
            message: '购物车已清空',
            type: 'success'
        })
    }).catch(() => { })
}

// 结算
const checkout = () => {
    if (cartStore.selectedCount === 0) {
        ElMessage.warning('请选择要结算的商品')
        return
    }

    router.push({
        path: '/checkout'
    })
}

// 去购物
const goShopping = () => {
    router.push({
        path: '/'
    })
}


</script>

<template>
    <div class="cart-page">
        <div class="cart-header">
            <h2>
                <el-icon>
                    <ShoppingCart />
                </el-icon>
                购物车
            </h2>
            <el-button type="text" @click="clearCart" v-if="cartStore.cartItems.length > 0">清空购物车</el-button>
        </div>

        <div v-if="cartStore.cartItems.length > 0">
            <el-table :data="cartStore.cartItems" style="width: 100%;">
                <el-table-column width="60">
                    <template #default="{ row }">
                        <el-checkbox v-model="row.selected" />
                    </template>
                </el-table-column>
                <el-table-column label="商品信息" width="500">
                    <template #default="{ row }">
                        <div class="product-info">
                            <el-image class="product-image" :src="row.image" />
                            <div class="product-details">
                                <h3 class="product-name">{{ row.name }}</h3>
                                <div class="product-tags">
                                    <el-tag type="info" size="small">{{ row.tag }}</el-tag>
                                </div>
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="单价" width="120">
                    <template #default="{ row }">¥{{ row.price }}</template>
                </el-table-column>
                <el-table-column label="数量" width="150">
                    <template #default="{ row }">
                        <el-input-number v-model="row.quantity" :min="1" :max="10" size="small"
                            @change="(val) => cartStore.updateQuantity(row.id, val)" />
                    </template>
                </el-table-column>
                <el-table-column label="小计" width="120">
                    <template #default="{ row }">
                        <span class="subtotal">¥{{ (row.price * row.quantity).toFixed(2) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="80">
                    <template #default="{ row }">
                        <el-button type="danger" icon="el-icon-delete" circle size="small" @click="removeItem(row)" />
                    </template>
                </el-table-column>
            </el-table>
            <div class="cart-summary">
                <div class="summary-left">
                    <el-checkbox v-model="allSelected" @change="handleAllSelectionChange">全选</el-checkbox>
                    <span class="selected-count">已选择 {{ cartStore.selectedCount }} 件商品</span>
                </div>
                <div class="summary-right">
                    <div class="total">
                        <span class="label">合计：</span>
                        <span class="amount">¥{{ cartStore.totalPrice }}</span>
                    </div>
                    <el-button type="danger" size="large" @click="checkout">结算</el-button>
                </div>
            </div>
        </div>
        <div v-else>
            <el-empty description="您的购物车还是空的">
                <el-button type="primary" @click="goShopping">去逛逛</el-button>
            </el-empty>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.cart-page {
    max-width: 1200px;
    margin: 20px auto;
    padding: 0 20px;

    .cart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #eee;

        h2 {
            display: flex;
            align-items: center;
            font-size: 24px;
            margin: 0;

            .el-icon {
                margin-right: 10px;
                font-size: 28px;
            }
        }
    }

    .product-info {
        display: flex;
        align-items: center;

        .product-image {
            width: 80px;
            height: 80px;
            margin-right: 15px;
            border-radius: 4px;
        }

        .product-details {
            .product-name {
                margin: 0 0 8px;
                font-size: 16px;
            }

            .product-tags {
                .el-tag {
                    margin-right: 5px;
                    margin-bottom: 5px;
                }
            }
        }
    }

    .subtotal {
        font-weight: bold;
        color: #e74a3b;
    }

    .cart-summary {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 20px;
        padding: 20px;
        background-color: #f8f9fc;
        border-radius: 8px;

        .summary-left {
            display: flex;
            align-items: center;

            .selected-count {
                margin-left: 20px;
                color: #666;
            }
        }

        .summary-right {
            display: flex;
            align-items: center;

            .total {
                margin-right: 30px;

                .label {
                    font-size: 16px;
                }

                .amount {
                    font-size: 24px;
                    font-weight: bold;
                    color: #e74a3b;
                }
            }

            .el-button {
                width: 150px;
                font-size: 16px;
                font-weight: bold;
            }
        }
    }

    .empty-cart {
        margin: 50px 0;
        text-align: center;

        .el-button {
            margin-top: 20px;
        }
    }

    .recommend-section {
        margin-top: 40px;

        h3 {
            font-size: 20px;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }

        .recommend-product {
            cursor: pointer;
            transition: transform 0.3s;

            &:hover {
                transform: translateY(-5px);
            }

            .product-image {
                width: 100%;
                height: 150px;
                object-fit: cover;
            }

            .product-info {
                padding: 15px;

                .product-name {
                    font-size: 14px;
                    height: 40px;
                    margin: 0 0 10px;
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                }

                .product-price {
                    .current-price {
                        font-size: 18px;
                        font-weight: bold;
                        color: #e74a3b;
                        margin-right: 10px;
                    }

                    .original-price {
                        font-size: 14px;
                        color: #999;
                        text-decoration: line-through;
                    }
                }
            }
        }
    }
}
</style>
