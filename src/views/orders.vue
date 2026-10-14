<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api/index'
import { resolveImage } from '@/utils/image'

const router = useRouter()
const orders = ref([])
const loading = ref(false)
const detailDialog = ref(false)
const currentOrder = ref(null)

const statusMap = {
    pending: { label: '待支付', type: 'warning' },
    paid: { label: '已支付', type: 'success' },
    cancelled: { label: '已取消', type: 'info' },
}

const loadOrders = async () => {
    loading.value = true
    try {
        const res = await api.get('/orders')
        orders.value = res.data || []
    } catch (e) {
        ElMessage.error(e.message || '加载订单失败')
    } finally {
        loading.value = false
    }
}

onMounted(loadOrders)

const viewDetail = async (orderId) => {
    try {
        const res = await api.get(`/orders/${orderId}`)
        currentOrder.value = res.data
        currentOrder.value.items = (res.data.items || []).map((it) => ({
            ...it,
            productImage: resolveImage(it.productImage),
        }))
        detailDialog.value = true
    } catch (e) {
        ElMessage.error(e.message || '加载订单详情失败')
    }
}

// 未支付订单可直接模拟支付
const payOrder = async (order) => {
    try {
        await ElMessageBox.confirm(
            `确认支付订单 ${order.orderNo}，金额 ¥${Number(order.totalAmount - order.discountAmount).toFixed(2)}（演示模拟支付）`,
            '模拟支付确认',
            { confirmButtonText: '确认支付', cancelButtonText: '取消', type: 'warning' }
        )
    } catch (e) {
        return
    }
    try {
        await api.post(`/orders/${order.id}/pay`)
        ElMessage.success('支付成功')
        loadOrders()
    } catch (e) {
        ElMessage.error(e.message || '支付失败')
    }
}

const fmtTime = (t) => (t ? String(t).replace('T', ' ').slice(0, 19) : '-')
const fmtAmount = (order) => Number(order.totalAmount - order.discountAmount).toFixed(2)
</script>

<template>
    <div class="orders-page">
        <div class="page-header">
            <h2>我的订单</h2>
            <el-button :loading="loading" @click="loadOrders">刷新</el-button>
        </div>

        <el-table v-loading="loading" :data="orders" style="width: 100%;" empty-text="暂无订单">
            <el-table-column label="订单号" min-width="200">
                <template #default="{ row }">
                    <span class="order-no" @click="viewDetail(row.id)">{{ row.orderNo }}</span>
                </template>
            </el-table-column>
            <el-table-column label="金额" width="140">
                <template #default="{ row }">¥{{ fmtAmount(row) }}</template>
            </el-table-column>
            <el-table-column label="支付方式" width="120">
                <template #default="{ row }">{{ row.paymentMethod || 'mock' }}</template>
            </el-table-column>
            <el-table-column label="状态" width="110">
                <template #default="{ row }">
                    <el-tag :type="statusMap[row.status]?.type || 'info'">{{ statusMap[row.status]?.label || row.status }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="创建时间" width="180">
                <template #default="{ row }">{{ fmtTime(row.createdAt) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="160">
                <template #default="{ row }">
                    <el-button size="small" @click="viewDetail(row.id)">详情</el-button>
                    <el-button v-if="row.status === 'pending'" size="small" type="primary" @click="payOrder(row)">
                        模拟支付
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 订单详情 -->
        <el-dialog v-model="detailDialog" title="订单详情" width="640px">
            <div v-if="currentOrder" class="order-detail">
                <div class="detail-head">
                    <p>订单号：<strong>{{ currentOrder.orderNo }}</strong></p>
                    <el-tag :type="statusMap[currentOrder.status]?.type || 'info'">
                        {{ statusMap[currentOrder.status]?.label || currentOrder.status }}
                    </el-tag>
                </div>
                <div class="detail-items">
                    <div v-for="(item, idx) in currentOrder.items" :key="idx" class="detail-item">
                        <el-image :src="item.productImage" class="item-img" fit="cover" />
                        <div class="item-info">
                            <strong>{{ item.productName }}</strong>
                            <p>¥{{ item.price }} x {{ item.quantity }}</p>
                            <p class="delivery">{{ item.deliveryContent || '无交付说明' }}</p>
                        </div>
                    </div>
                </div>
                <div class="detail-summary">
                    <p>商品总价：¥{{ Number(currentOrder.totalAmount).toFixed(2) }}</p>
                    <p>优惠金额：-¥{{ Number(currentOrder.discountAmount).toFixed(2) }}</p>
                    <p class="pay-amount">实付金额：¥{{ fmtAmount(currentOrder) }}</p>
                </div>
            </div>
            <template #footer>
                <el-button @click="detailDialog = false">关闭</el-button>
                <el-button v-if="currentOrder?.status === 'pending'" type="primary" @click="payOrder(currentOrder); detailDialog = false">
                    模拟支付
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>
.orders-page {
    max-width: 1200px;
    margin: 20px auto;
    padding: 0 20px;
    min-height: 60vh;

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h2 {
            font-size: 24px;
            margin: 0;
        }
    }

    .order-no {
        color: #4e73df;
        cursor: pointer;
        font-weight: 500;
    }

    .order-detail {
        .detail-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 12px;
            border-bottom: 1px solid #eee;
        }

        .detail-items {
            margin: 15px 0;

            .detail-item {
                display: flex;
                gap: 15px;
                padding: 10px 0;
                border-bottom: 1px dashed #eee;

                .item-img {
                    width: 64px;
                    height: 64px;
                    border-radius: 4px;
                    flex-shrink: 0;
                }

                .item-info {
                    p {
                        margin: 4px 0;
                        color: #666;
                        font-size: 13px;
                    }

                    .delivery {
                        color: #67c23a;
                        word-break: break-all;
                    }
                }
            }
        }

        .detail-summary {
            text-align: right;
            padding: 10px 0;

            p {
                margin: 5px 0;
                color: #666;
            }

            .pay-amount {
                font-size: 18px;
                font-weight: bold;
                color: #e74a3b;
            }
        }
    }
}
</style>
