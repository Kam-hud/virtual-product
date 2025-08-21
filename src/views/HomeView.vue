<script setup>
import { ref, computed, onMounted } from 'vue'
import { Coin, Tickets, Goods, Picture, Download, CreditCard, RefreshRight, Service, VideoCameraFilled, Headset, Document } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import api from '@/api/index.js'

// 导入图片资源
import banner1 from '@/assets/banners/Virtual_banner1.jpg'
import banner2 from '@/assets/banners/Virtual_banner2.jpg'
import banner3 from '@/assets/banners/Virtual_banner3.jpg'

// 路由
const router = useRouter()

const banners = ref([
    {
        id: 1,
        image: banner1,
        title: '虚拟产品banner1',
        link: '/products',
        type: 'link'
    },
    {
        id: 2,
        image: banner2,
        title: '虚拟产品banner2',
        link: '/products',
        type: 'link'
    },
    {
        id: 3,
        image: banner3,
        title: '虚拟产品banner3',
        link: '/products',
        type: 'link'
    }
])

const categories = ref([
    { id: 1, name: '全部', icon: 'Goods' },
    { id: 2, name: '软件', icon: 'Coin' },
    { id: 3, name: '虚拟物品', icon: 'CreditCard' },
    { id: 4, name: '课程', icon: 'Tickets' },
    { id: 5, name: '素材', icon: 'Picture' },
    { id: 6, name: '影视', icon: 'VideoCameraFilled' },
    { id: 7, name: '音乐', icon: 'Headset' },
    { id: 8, name: '模板', icon: 'Document' },
])

// 选中的分类ID
const selectedCategory = ref(1)
// 选择分类的方法
const selectCategory = (categoryId) => {
    selectedCategory.value = categoryId
    // 这里可以添加根据分类筛选产品的逻辑
}
// 根据选中的分类筛选产品
const filteredProducts = computed(() => {
    if (selectedCategory.value === 1) {
        return products.value
    } else {
        return products.value.filter(product => product.categoryId === selectedCategory.value)
    }
})

const products = ref([])
const loading = ref(true)

// 从数据库中获取数据
const fetchProducts = async () => {
    try {
        loading.value = true
        const res = await api.get('/products')
        products.value = res.data
    } catch (error) {
        console.error('❌ 获取商品错误:', error);
        ElMessage.error('获取商品失败')
        loading.value = false
    }
}

onMounted(() => {
    fetchProducts()
})

// 特色服务数据
const features = ref([
    {
        id: 1,
        title: '即时下载',
        description: '购买后立即获得下载链接，无需等待',
        icon: 'Download',
        color: '#4e73df'
    },
    {
        id: 2,
        title: '安全支付',
        description: '多种支付方式，资金安全有保障',
        icon: 'CreditCard',
        color: '#1cc88a'
    },
    {
        id: 3,
        title: '7天退款',
        description: '对产品不满意？7天内无理由退款',
        icon: 'RefreshRight',
        color: '#f6c23e'
    },
    {
        id: 4,
        title: '专业客服',
        description: '专业团队7*24小时在线服务',
        icon: 'Service',
        color: '#e74a3b'
    }
])

// 查看产品详情
const viewProductDetail = (product) => {
    // 这里可以添加跳转到产品详情页的逻辑
    router.push({
        path: `/product/${product.id}`
    })

}

// 添加到购物车
const addToCart = (product) => {
    // 这里可以添加添加到购物车的逻辑
    router.push({
        path: '/cart'
    })
}
</script>

<template>
    <div class="home-page">
        <!-- 轮播图 -->
        <el-carousel height="400px" indicator-position="outside" class="banner">
            <el-carousel-item v-for="item in banners" :key="item.id">
                <img :src="item.image" alt="Banner" class="banner-image" />
            </el-carousel-item>
        </el-carousel>

        <!-- 分类导航 -->
        <div class="category-nav">
            <el-scrollbar>
                <div class="category-list">
                    <div v-for="category in categories" :key="category.id" class="category-item"
                        @click="selectCategory(category.id)" :class="{ active: selectedCategory === category.id }">
                        <!-- 显示icon -->
                        <el-icon :size="32">
                            <component :is="category.icon" />
                        </el-icon>
                        <span>{{ category.name }}</span>
                    </div>
                </div>
            </el-scrollbar>
        </div>

        <!-- 商品展示 -->
        <div class="product-section">
            <div class="section-header">
                <h2>热门虚拟产品</h2>
                <el-button type="text">查看更多</el-button>
            </div>
            <el-row :gutter="20" class="product-list">
                <el-col v-for="product in filteredProducts" :key="product.id" :xs="12" :sm="8" :md="6"
                    class="product-item">
                    <el-card shadow="hover" @click="viewProductDetail(product)">
                        <img :src="product.image" class="product-image" />
                        <div class="product-info">
                            <h3 class="product-title">{{ product.name }}</h3>
                            <div class="product-price">
                                <span class="current-price">¥{{ product.price }}</span>
                                <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice
                                }}</span>
                            </div>
                            <div class="product-actions">
                                <el-button type="primary" size="small" @click.stop="addToCart(product)">
                                    加入购物车
                                </el-button>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </div>

        <!-- 特色服务 -->
        <div class="feature-section">
            <el-row :gutter="30">
                <el-col :span="6" v-for="feature in features" :key="feature.id">
                    <div class="feature-card">
                        <el-icon :size="48" :color="feature.color">
                            <component :is="feature.icon" />
                        </el-icon>
                        <h3>{{ feature.title }}</h3>
                        <p>{{ feature.description }}</p>
                    </div>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.home-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;

    .banner {
        margin: 20px 0 30px;
        border-radius: 8px;
        overflow: hidden;

        .banner-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    .category-nav {
        margin-bottom: 30px;

        .category-list {
            display: flex;
            gap: 15px;
            padding: 10px 0;

            .category-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 15px 20px;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
                min-width: 96px;

                &:hover,
                &.active {
                    background-color: #f8f9fc;
                    color: #4e73df;

                    .el-icon {
                        color: #4e73df;
                    }
                }

                span {
                    margin-top: 8px;
                    font-size: 14px;
                }
            }
        }
    }

    .product-section {
        margin-bottom: 40px;

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;

            h2 {
                font-size: 24px;
                color: #333;
            }
        }

        .product-list {
            .product-item {
                margin-bottom: 20px;

                .el-card {
                    transition: transform 0.3s, box-shadow 0.3s;
                    cursor: pointer;

                    &:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                    }
                }

                .product-image {
                    width: 100%;
                    height: 180px;
                    object-fit: cover;
                }

                .product-info {
                    padding: 15px;

                    .product-title {
                        font-size: 16px;
                        margin-bottom: 10px;
                        height: 44px;
                        overflow: hidden;
                        display: -webkit-box;
                        -webkit-box-orient: vertical;
                    }

                    .product-price {
                        margin-bottom: 10px;

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

                    .product-actions {
                        display: flex;
                        justify-content: center;
                    }
                }
            }
        }
    }

    .feature-section {
        background-color: #f8f9fc;
        padding: 30px;
        border-radius: 8px;
        margin-bottom: 40px;

        .feature-card {
            text-align: center;
            padding: 20px 15px;

            h3 {
                margin: 15px 0 10px;
                font-size: 18px;
            }

            p {
                color: #6e707e;
                font-size: 14px;
                line-height: 1.5;
            }
        }
    }
}
</style>