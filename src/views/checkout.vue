<script setup>
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()
</script>

<template>
    <div class="checkout-pag">
        <div class="container">
            <el-steps :active="activeStep" align-center>
                <el-step title="确认订单" />
                <el-step title="支付订单" />
                <el-step title="完成订单" />
            </el-steps>

            <div class="checkout-content">
                <!-- 确认订单 -->
                <div class="step1">
                    <div class="order-section">
                        <h3 class="section-title">订单信息</h3>
                        <el-table style="width: 100%;">
                            <el-table-column label="商品信息" prop="name" width="500">
                                <template #default="{ row }">
                                    <div class="product-info">
                                        <el-image class="product-image" :src="row.image" />
                                        <div class="product-details">
                                            <h4 class="product-name">{{ row.name || '虚拟商品' }}</h4>
                                            <div class="product-tags">
                                                <el-tag size="small">{{ row.tag }}</el-tag>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column label="单价" prop="price" width="120">
                                <template #default="{ row }">￥{{ row.price }}</template>
                            </el-table-column>
                            <el-table-column label="数量" prop="quantity" width="150">
                                <template #default="{ row }">
                                    <el-input-number v-model="row.quantity" :min="1" :max="10" size="small" />
                                </template>
                            </el-table-column>
                            <el-table-column label="小计" prop="subtotal" width="120">
                                <template #default="{ row }">
                                    <span class="subtotal">￥{{ row.price * row.quantity }}</span>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                    <div class="order-summary">
                        <div class="summary-card">
                            <h3 class="summary-title">订单总计</h3>
                            <div class="summary-item">
                                <span>商品总价:</span>
                                <span>¥{{ cartStore.totalPrice }}</span>
                            </div>
                            <div class="summary-item">
                                <span>优惠折扣:</span>
                                <span class="discount">-¥{{ discountAmount }}</span>
                            </div>
                            <div class="summary-item total">
                                <span>应付总额:</span>
                                <span class="amount">¥{{ (cartStore.totalPrice - discountAmount) }}</span>
                            </div>

                            <div class="coupon-section">
                                <el-input v-model="couponCode" placeholder="输入优惠码" size="large">
                                    <template #append>
                                        <el-button @click="applyCoupon">应用</el-button>
                                    </template>
                                </el-input>
                                <el-tag v-if="appliedCoupon" type="success" closable @close="removeCoupon">
                                    已应用优惠码: {{ appliedCoupon.code }} ({{ appliedCoupon.discount * 100 }}% 折扣)
                                </el-tag>
                            </div>

                            <el-button type="primary" size="large" class="next-btn" @click="activeStep = 2">
                                下一步：支付订单
                            </el-button>
                        </div>
                    </div>
                </div>

                <!-- 支付订单 -->
                <div class="step2">
                    <div class="payment-section">
                        <h3 class="section-title">选择支付方式</h3>

                        <div class="payment-methods">
                            <el-radio-group v-model="paymentMethod">
                                <el-radio :label="1">
                                    <div class="payment-method">
                                        <el-icon>
                                            <Wechat />
                                        </el-icon>
                                        <span>微信支付</span>
                                    </div>
                                </el-radio>
                                <el-radio :label="2" border>
                                    <div class="payment-method">
                                        <el-icon>
                                            <Alipay />
                                        </el-icon>
                                        <span>支付宝</span>
                                    </div>
                                </el-radio>
                                <el-radio :label="3" border>
                                    <div class="payment-method">
                                        <el-icon>
                                            <CreditCard />
                                        </el-icon>
                                        <span>银行卡支付</span>
                                    </div>
                                </el-radio>
                                <el-radio :label="4">
                                    <div class="payment-method">
                                        <el-icon>
                                            <Wallet />
                                        </el-icon>
                                        <!-- <span>余额支付 (¥{{ user.balance.toFixed(2) }})</span> -->
                                    </div>
                                </el-radio>
                            </el-radio-group>
                        </div>

                        <div class="payment-amount">
                            <h4>支付金额</h4>
                            <div class="amount">¥{{ (cartStore.totalPrice - discountAmount).toFixed(2) }}</div>
                        </div>

                        <div class="action-buttons">
                            <el-button @click="activeStep = 1">上一步</el-button>
                            <el-button type="primary" @click="handlePayment">立即支付</el-button>
                        </div>
                    </div>
                </div>

                <!-- 步骤3: 完成订单 -->
                <div class="step3">
                    <div class="success-container">
                        <el-result icon="success" title="支付成功!" sub-title="您的订单已成功支付，商品已添加到您的账户">
                            <template #extra>
                                <div class="order-info">
                                    <p>订单号: <span>{{ orderId }}</span></p>
                                    <p>支付金额: <span>¥{{ (cartStore.totalPrice - discountAmount).toFixed(2) }}</span></p>
                                    <p>支付时间: <span>{{ paymentTime }}</span></p>
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

    .el-steps {
        margin-bottom: 40px;
    }

    .checkout-content {
        background: #fff;
        border-radius: 8px;
        padding: 30px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

        .step1 {
            display: grid;
            grid-template-columns: 1fr 350px;
            gap: 30px;

            .order-section {
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
            }

            .order-summary {
                .summary-card {
                    background: #f8f9fc;
                    border-radius: 8px;
                    padding: 20px;

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

                        .discount {
                            color: #1cc88a;
                        }
                    }

                    .coupon-section {
                        margin: 20px 0;

                        .el-tag {
                            width: 100%;
                            margin-top: 10px;
                            justify-content: center;
                        }
                    }

                    .next-btn {
                        width: 100%;
                        font-size: 16px;
                        font-weight: 500;
                    }
                }
            }
        }

        .step2 {
            .payment-section {
                max-width: 700px;
                margin: 0 auto;

                .payment-methods {
                    margin-bottom: 30px;

                    .el-radio-group {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 15px;
                        width: 100%;
                    }

                    .el-radio {
                        margin: 0;
                        height: 80px;
                        display: flex;
                        align-items: center;

                        :deep(.el-radio__label) {
                            display: flex;
                            align-items: center;
                        }
                    }

                    .payment-method {
                        display: flex;
                        align-items: center;
                        padding: 10px;

                        .el-icon {
                            font-size: 30px;
                            margin-right: 10px;
                        }

                        span {
                            font-size: 16px;
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
                    margin: 20px 0;
                    text-align: left;

                    p {
                        margin-bottom: 10px;
                        font-size: 16px;

                        span {
                            font-weight: bold;
                            margin-left: 10px;
                        }
                    }
                }

                .action-buttons {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin-top: 30px;

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

    .step2 .payment-section .payment-methods .el-radio-group {
        grid-template-columns: 1fr !important;
    }
}
</style>