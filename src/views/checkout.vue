<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import api from '@/api/index'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

// 流程步骤：0 确认订单 -> 1 选择支付 -> 2 支付成功
const activeStep = ref(0)
const paymentMethod = ref('mock')
const submitting = ref(false)
const orderResult = ref(null)

const selectedItems = computed(() => cartStore.cartItems.filter((item) => item.selected))
const totalPrice = computed(() => cartStore.totalPrice)

// 支付方式
const paymentMethods = [
    { value: 'wechat', label: '微信支付', desc: '模拟支付' },
    { value: 'alipay', label: '支付宝', desc: '模拟支付' },
    { value: 'card', label: '银行卡', desc: '模拟支付' },
    { value: 'mock', label: '模拟支付', desc: '演示环境，直接完成' },
]

onMounted(() => {
    if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录')
        router.push('/login')
        return
    }
    if (cartStore.cartItems.length === 0) {
        cartStore.loadCart()
    }
})

// 下一步：进入支付
const goPay = () => {
    if (selectedItems.value.length === 0) {
        ElMessage.warning('没有选中的商品')
        return
    }
    activeStep.value = 1
}

// 提交订单
const submitOrder = async () => {
    submitting.value = true
    try {
        const res = await api.post('/orders', {
            paymentMethod: paymentMethod.value,
            discountAmount: 0,
        })
        orderResult.value = {
            orderId: res.data.orderId,
            orderNo: res.data.orderNo,
            totalAmount: Number(res.data.totalAmount || totalPrice.value),
        }
        activeStep.value = 2
        ElMessage.success('订单已创建')
    } catch (e) {
        ElMessage.error(e.message || '下单失败，请重试')
    } finally {
        submitting.value = false
    }
}

// 模拟支付
const handlePayment = async () => {
    if (!orderResult.value) {
        await submitOrder()
        return
    }
    try {
        await ElMessageBox.confirm(
            `确认支付 ¥${orderResult.value.totalAmount.toFixed(2)}（演示环境模拟支付）`,
            '模拟支付确认',
            { confirmButtonText: '确认支付', cancelButtonText: '取消', type: 'warning' }
        )
    } catch (e) {
        return
    }
    submitting.value = true
    try {
        const res = await api.post(`/orders/${orderResult.value.orderId}/pay`)
        orderResult.value.delivery = res.data.delivery || []
        orderResult.value.paidAt = res.data.order?.paid_at || new Date().toLocaleString()
        ElMessage.success('支付成功')
    } catch (e) {
        ElMessage.error(e.message || '支付失败，请重试')
    } finally {
        submitting.value = false
    }
}

const goHome = () => router.push('/')
const viewOrder = () => router.push('/orders')
</script>

<template>
    <div class="checkout-page">
        <div class="container">
            <el-steps :active="activeStep" align-center finish-status="success">
                <el-step title="确认订单" />
                <el-step title="支付订单" />
                <el-step title="完成订单" />
            </el-steps>

            <!-- 步骤1：确认订单 -->
            <div v-if="activeStep === 0" class="checkout-content">
                <div class="step1">
                    <div class="order-section">
                        <h3 class="section-title">订单信息</h3>
                        <el-table :data="selectedItems" style="width: 100%;">
                            <el-table-column label="商品信息" min-width="380">
                                <template #default="{ row }">
                                    <div class="product-info">
                                        <el-image class="product-image" :src="row.image" fit="cover" />
                                        <div class="product-details">
                                            <h4 class="product-name">{{ row.name || '虚拟商品' }}</h4>
                                            <div class="product-tags">
                                                <el-tag size="small">{{ row.tag || '虚拟商品' }}</el-tag>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column label="单价" width="120">
                                <template #default="{ row }">¥{{ row.price }}</template>
                            </el-table-column>
                            <el-table-column label="数量" width="100">
                                <template #default="{ row }">x{{ row.quantity }}</template>
                            </el-table-column>
                            <el-table-column label="小计" width="120">
                                <template #default="{ row }">
                                    <span class="subtotal">¥{{ (row.price * row.quantity).toFixed(2) }}</span>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>

                    <div class="order-summary">
                        <div class="summary-card">
                            <h3 class="summary-title">订单总计</h3>
                            <div class="summary-item">
                                <span>商品数量</span>
                                <span>{{ cartStore.selectedCount }} 件</span>
                            </div>
                            <div class="summary-item">
                                <span>商品总价</span>
                                <span>¥{{ totalPrice }}</span>
                            </div>
                            <div class="summary-item total">
                                <span>应付总额</span>
                                <span class="amount">¥{{ totalPrice }}</span>
                            </div>
                            <el-button type="primary" size="large" class="next-btn" :disabled="selectedItems.length === 0"
                                @click="goPay">
                                下一步：支付订单
                            </el-button>
                            <p class="hint">演示环境使用模拟支付，不会产生真实扣款</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 步骤2：支付订单 -->
            <div v-if="activeStep === 1" class="checkout-content">
                <div class="step2">
                    <div class="payment-section">
                        <h3 class="section-title">选择支付方式</h3>
                        <div class="payment-methods">
                            <div v-for="method in paymentMethods" :key="method.value" class="payment-method-item"
                                :class="{ active: paymentMethod === method.value }" @click="paymentMethod = method.value">
                                <div class="payment-method">
                                    <span class="method-name">{{ method.label }}</span>
                                    <span class="method-desc">{{ method.desc }}</span>
                                </div>
                                <el-radio :value="method.value" v-model="paymentMethod">
                                    <span></span>
                                </el-radio>
                            </div>
                        </div>

                        <div class="payment-amount">
                            <h4>支付金额</h4>
                            <div class="amount">¥{{ totalPrice }}</div>
                        </div>

                        <div class="action-buttons">
                            <el-button size="large" @click="activeStep = 0">上一步</el-button>
                            <el-button type="primary" size="large" :loading="submitting" @click="submitOrder">
                                提交订单
                            </el-button>
                        </div>
                        <p class="hint">提交后将创建订单，可直接完成模拟支付</p>
                    </div>
                </div>
            </div>

            <!-- 步骤3：完成订单 -->
            <div v-if="activeStep === 2" class="checkout-content">
                <div class="step3">
                    <div class="success-container">
                        <el-result icon="success" title="订单已提交" :sub-title="orderResult?.delivery ? '支付成功，商品已交付' : '订单创建成功，请完成支付'">
                            <template #extra>
                                <div class="order-info">
                                    <p>订单号: <span>{{ orderResult?.orderNo }}</span></p>
                                    <p>支付金额: <span>¥{{ orderResult?.totalAmount?.toFixed?.(2) ?? orderResult?.totalAmount }}</span></p>
                                    <p v-if="orderResult?.delivery?.length">支付时间: <span>{{ orderResult?.paidAt }}</span></p>
                                </div>

                                <div v-if="orderResult?.delivery?.length" class="delivery-box">
                                    <h4>已交付内容</h4>
                                    <div v-for="(item, idx) in orderResult.delivery" :key="idx" class="delivery-item">
                                        <strong>{{ item.name }}</strong>
                                        <p>{{ item.deliveryContent || '无交付说明' }}</p>
                                    </div>
                                </div>

                                <div v-if="!orderResult?.delivery?.length" class="pay-again">
                                    <el-button type="primary" :loading="submitting" @click="handlePayment">
                                        立即模拟支付
                                    </el-button>
                                </div>

                                <div class="action-buttons">
                                    <el-button @click="viewOrder">查看订单</el-button>
                                    <el-button type="primary" @click="goHome">返回首页</el-button>
                                </div>
                            </template>
                        </el-result>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.checkout-page {
    padding: 30px 0 50px;
    min-height: 60vh;

    .el-steps {
        margin-bottom: 40px;
    }

    .checkout-content {
        background: #fff;
        border-radius: 8px;
        padding: 30px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

        .section-title {
            font-size: 18px;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }

        .step1 {
            display: grid;
            grid-template-columns: 1fr 350px;
            gap: 30px;

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
                }
            }

            .subtotal {
                font-weight: bold;
                color: #e74a3b;
            }

            .order-summary {
                .summary-card {
                    background: #f8f9fc;
                    border-radius: 8px;
                    padding: 20px;
                    position: sticky;
                    top: 80px;

                    .summary-title {
                        font-size: 18px;
                        margin-bottom: 20px;
                        padding-bottom: 10px;
                        border-bottom: 1px solid #eee;
                    }

                    .summary-item {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 15px;
                        font-size: 15px;

                        &.total {
                            margin-top: 20px;
                            padding-top: 15px;
                            border-top: 1px solid #eee;
                            font-size: 18px;
                            font-weight: bold;

                            .amount {
                                color: #e74a3b;
                                font-size: 22px;
                            }
                        }
                    }

                    .next-btn {
                        width: 100%;
                        font-size: 16px;
                        font-weight: 500;
                    }

                    .hint {
                        text-align: center;
                        color: #999;
                        font-size: 12px;
                        margin-top: 10px;
                    }
                }
            }
        }

        .step2 {
            .payment-section {
                max-width: 700px;
                margin: 0 auto;

                .payment-methods {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                    margin-bottom: 30px;

                    .payment-method-item {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 18px;
                        border: 1px solid #e4e7ed;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.2s;

                        &:hover,
                        &.active {
                            border-color: #4e73df;
                            background: #f0f4ff;
                        }

                        .payment-method {
                            display: flex;
                            flex-direction: column;

                            .method-name {
                                font-size: 16px;
                                font-weight: 500;
                            }

                            .method-desc {
                                font-size: 12px;
                                color: #999;
                                margin-top: 4px;
                            }
                        }
                    }
                }

                .payment-amount {
                    text-align: center;
                    margin: 40px 0;

                    h4 {
                        font-size: 16px;
                        margin-bottom: 10px;
                        color: #666;
                    }

                    .amount {
                        font-size: 32px;
                        font-weight: bold;
                        color: #e74a3b;
                    }
                }

                .action-buttons {
                    display: flex;
                    justify-content: center;
                    gap: 20px;

                    .el-button {
                        width: 150px;
                    }
                }

                .hint {
                    text-align: center;
                    color: #999;
                    font-size: 12px;
                    margin-top: 15px;
                }
            }
        }

        .step3 {
            .success-container {
                max-width: 600px;
                margin: 0 auto;
                padding: 30px 0;

                .order-info {
                    background: #f8f9fc;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 20px;
                    text-align: left;

                    p {
                        margin-bottom: 10px;
                        font-size: 15px;

                        span {
                            font-weight: bold;
                            margin-left: 10px;
                        }
                    }
                }

                .delivery-box {
                    background: #f0f9eb;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 20px;
                    text-align: left;

                    h4 {
                        margin-bottom: 12px;
                        color: #67c23a;
                    }

                    .delivery-item {
                        padding: 8px 0;
                        border-bottom: 1px dashed #e4e7ed;

                        &:last-child {
                            border-bottom: none;
                        }

                        p {
                            margin: 6px 0 0;
                            color: #666;
                            font-size: 14px;
                            word-break: break-all;
                        }
                    }
                }

                .pay-again {
                    margin-bottom: 20px;
                }

                .action-buttons {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin-top: 20px;

                    .el-button {
                        width: 150px;
                    }
                }
            }
        }
    }
}

@media (max-width: 992px) {
    .checkout-content .step1 {
        grid-template-columns: 1fr;

        .order-summary {
            margin-top: 30px;
        }
    }

    .step2 .payment-section .payment-methods {
        grid-template-columns: 1fr;
    }
}
</style>
