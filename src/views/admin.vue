<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api/index'
import { resolveImage } from '@/utils/image'

const activeTab = ref('products')
const stats = ref({ users: 0, products: 0, orders: 0, revenue: 0 })
const products = ref([])
const orders = ref([])
const categories = ref([])
const loading = ref(false)

// 编辑商品
const editDialog = ref(false)
const editingProduct = ref(null)
const editForm = ref({ name: '', price: 0, status: 'on', categoryId: null })

const statusMap = {
    pending: { label: '待支付', type: 'warning' },
    paid: { label: '已支付', type: 'success' },
    cancelled: { label: '已取消', type: 'info' },
}

const loadStats = async () => {
    try {
        const res = await api.get('/admin/stats')
        stats.value = res.data
    } catch (e) {
        ElMessage.error(e.message || '加载统计失败')
    }
}

const loadProducts = async () => {
    loading.value = true
    try {
        const [pRes, cRes] = await Promise.all([
            api.get('/admin/products'),
            api.get('/categories'),
        ])
        products.value = (pRes.data || []).map((p) => ({ ...p, image: resolveImage(p.image) }))
        categories.value = cRes.data || []
    } catch (e) {
        ElMessage.error(e.message || '加载商品失败')
    } finally {
        loading.value = false
    }
}

const loadOrders = async () => {
    loading.value = true
    try {
        const res = await api.get('/admin/orders')
        orders.value = res.data || []
    } catch (e) {
        ElMessage.error(e.message || '加载订单失败')
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    loadStats()
    loadProducts()
    loadOrders()
})

const switchTab = (tab) => {
    activeTab.value = tab
    if (tab === 'stats') loadStats()
    if (tab === 'products') loadProducts()
    if (tab === 'orders') loadOrders()
}

const openEdit = (product) => {
    editingProduct.value = product
    editForm.value = {
        name: product.name,
        price: Number(product.price),
        status: product.status,
        categoryId: product.categoryId,
    }
    editDialog.value = true
}

const saveEdit = async () => {
    if (!editingProduct.value) return
    try {
        await api.put(`/admin/products/${editingProduct.value.id}`, {
            name: editForm.value.name,
            price: Number(editForm.value.price),
            status: editForm.value.status,
            categoryId: editForm.value.categoryId,
        })
        ElMessage.success('商品已更新')
        editDialog.value = false
        loadProducts()
        loadStats()
    } catch (e) {
        ElMessage.error(e.message || '更新失败')
    }
}

const toggleStatus = async (product) => {
    const next = product.status === 'on' ? 'off' : 'on'
    try {
        await api.put(`/admin/products/${product.id}`, { status: next })
        ElMessage.success(next === 'on' ? '已上架' : '已下架')
        loadProducts()
    } catch (e) {
        ElMessage.error(e.message || '操作失败')
    }
}

const categoryName = (id) => categories.value.find((c) => Number(c.id) === Number(id))?.name || '-'
const fmtTime = (t) => (t ? String(t).replace('T', ' ').slice(0, 19) : '-')
</script>

<template>
    <div class="admin-page">
        <div class="page-header">
            <h2>管理后台</h2>
            <el-button :loading="loading" @click="switchTab(activeTab)">刷新</el-button>
        </div>

        <!-- 统计概览 -->
        <div v-if="activeTab === 'stats'" class="stats-section">
            <el-row :gutter="20">
                <el-col :span="6">
                    <div class="stat-card blue">
                        <div class="stat-value">{{ stats.users }}</div>
                        <div class="stat-label">注册用户</div>
                    </div>
                </el-col>
                <el-col :span="6">
                    <div class="stat-card green">
                        <div class="stat-value">{{ stats.products }}</div>
                        <div class="stat-label">在售商品</div>
                    </div>
                </el-col>
                <el-col :span="6">
                    <div class="stat-card orange">
                        <div class="stat-value">{{ stats.orders }}</div>
                        <div class="stat-label">订单总数</div>
                    </div>
                </el-col>
                <el-col :span="6">
                    <div class="stat-card red">
                        <div class="stat-value">¥{{ Number(stats.revenue).toFixed(2) }}</div>
                        <div class="stat-label">累计销售额</div>
                    </div>
                </el-col>
            </el-row>
        </div>

        <!-- 商品管理 -->
        <div v-if="activeTab === 'products'">
            <el-table v-loading="loading" :data="products" style="width: 100%;">
                <el-table-column label="商品" min-width="280">
                    <template #default="{ row }">
                        <div class="product-cell">
                            <el-image :src="row.image" class="p-img" fit="cover" />
                            <span>{{ row.name }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="分类" width="110">
                    <template #default="{ row }">{{ categoryName(row.categoryId) }}</template>
                </el-table-column>
                <el-table-column label="价格" width="110">
                    <template #default="{ row }">¥{{ Number(row.price).toFixed(2) }}</template>
                </el-table-column>
                <el-table-column label="销量" width="90" prop="sales" />
                <el-table-column label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.status === 'on' ? 'success' : 'info'">
                            {{ row.status === 'on' ? '上架' : '下架' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180">
                    <template #default="{ row }">
                        <el-button size="small" @click="openEdit(row)">编辑</el-button>
                        <el-button size="small" :type="row.status === 'on' ? 'warning' : 'success'" @click="toggleStatus(row)">
                            {{ row.status === 'on' ? '下架' : '上架' }}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 订单管理 -->
        <div v-if="activeTab === 'orders'">
            <el-table v-loading="loading" :data="orders" style="width: 100%;">
                <el-table-column label="订单号" min-width="190" prop="orderNo" />
                <el-table-column label="用户" width="140" prop="username" />
                <el-table-column label="金额" width="120">
                    <template #default="{ row }">¥{{ Number(row.totalAmount - row.discountAmount).toFixed(2) }}</template>
                </el-table-column>
                <el-table-column label="支付方式" width="110">
                    <template #default="{ row }">{{ row.paymentMethod || 'mock' }}</template>
                </el-table-column>
                <el-table-column label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="statusMap[row.status]?.type || 'info'">{{ statusMap[row.status]?.label || row.status }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="创建时间" width="170">
                    <template #default="{ row }">{{ fmtTime(row.createdAt) }}</template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 编辑商品对话框 -->
        <el-dialog v-model="editDialog" title="编辑商品" width="480px">
            <el-form :model="editForm" label-width="80px">
                <el-form-item label="商品名称">
                    <el-input v-model="editForm.name" />
                </el-form-item>
                <el-form-item label="价格">
                    <el-input-number v-model="editForm.price" :min="0" :precision="2" />
                </el-form-item>
                <el-form-item label="分类">
                    <el-select v-model="editForm.categoryId" style="width: 100%;">
                        <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="状态">
                    <el-radio-group v-model="editForm.status">
                        <el-radio value="on">上架</el-radio>
                        <el-radio value="off">下架</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="editDialog = false">取消</el-button>
                <el-button type="primary" @click="saveEdit">保存</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>
.admin-page {
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

    .stats-section {
        .stat-card {
            border-radius: 8px;
            padding: 24px;
            color: #fff;
            text-align: center;
            margin-bottom: 20px;

            .stat-value {
                font-size: 30px;
                font-weight: bold;
            }

            .stat-label {
                margin-top: 8px;
                font-size: 14px;
                opacity: 0.9;
            }

            &.blue { background: #4e73df; }
            &.green { background: #1cc88a; }
            &.orange { background: #f6c23e; color: #333; }
            &.red { background: #e74a3b; }
        }
    }

    .product-cell {
        display: flex;
        align-items: center;
        gap: 12px;

        .p-img {
            width: 48px;
            height: 48px;
            border-radius: 4px;
            flex-shrink: 0;
        }
    }
}
</style>
