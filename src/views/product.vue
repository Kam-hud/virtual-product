<script setup>
import { ref, onMounted } from 'vue'
import { ShoppingCart } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import api from '@/api/index.js'
import { useCartStore } from '@/stores/cart'
import { fallbackProducts } from '@/api/fallbackData'
import { resolveImage } from '@/utils/image'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const quantity = ref(1)
const product = ref({})
const loading = ref(true)
const isFallback = ref(false)
const cartStore = useCartStore()

const fetchProduct = async () => {
    try {
        loading.value = true
        const res = await api.get(`/products/${route.params.id}`)
        product.value = { ...res.data, image: resolveImage(res.data.image) }
        isFallback.value = false
    } catch (error) {
        console.warn('后端不可用，尝试静态兜底:', error)
        const fallback = fallbackProducts.find((p) => String(p.id) === String(route.params.id))
        if (fallback) {
            product.value = fallback
            isFallback.value = true
        } else {
            ElMessage.error('商品不存在')
        }
    } finally {
        loading.value = false
    }
}

onMounted(fetchProduct)

const goBack = () => {
    router.back()
}

const addCart = () => {
    if (isFallback.value) {
        ElMessage.warning('演示数据不可下单，请连接后端服务')
        return
    }
    cartStore.addItem(product.value, quantity.value)
}
</script>

<template>
    <div class="product-detail">
        <el-page-header @back="goBack" title="产品详情" />
        <el-alert v-if="isFallback" type="warning" show-icon :closable="false" class="fallback-alert"
        title="后端服务暂不可用，当前展示演示数据（仅可浏览，不可下单）" />
<div class="product-container">
            <el-row :gutter="40">
                <!-- 商品图片 -->
                <el-col :span="12">
                    <div class="product-gallery">
                        <el-image :src="product.image" class="main-image" />
                        <div class="thumbnails">
                            <el-image :src="product.image" class="thumbnail" />
                        </div>
                    </div>
                </el-col>
                <!-- 商品信息 -->
                <el-col :span="12">
                    <div class="product-info">
                        <h1 class="product-title">{{ product.name }}</h1>
                        <div class="product-meta">
                            <div class="rating">
                                <el-rate :model-value="product.rating" disabled show-score text-color="#ff9900"
                                    score-template="{value} 分" />
                                <span class="sales">已售{{ product.sales || 0 }}件</span>
                            </div>
                            <div class="price-section">
                                <span class="current-price">¥{{ product.price }}</span>
                                <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice
                                    }}</span>
                                <el-tag type="danger" class="discount-tag">骨折</el-tag>
                            </div>
                            <div class="promotions">
                                <el-tag type="success" class="promo-tag">限时优惠</el-tag>
                                <el-tag type="warning" class="promo-tag">会员折扣</el-tag>
                            </div>
                        </div>
                        <div class="product-description">
                            <h3>商品描述</h3>
                            <p>{{ product.description }}</p>
                        </div>
                        <div class="product-actions">
                            <div class="quantity">
                                <span>数量：</span>
                                <el-input-number v-model="quantity" :min="1" :max="10" />
                            </div>
                            <div class="buttons">
                                <el-button type="primary" size="large" @click="addCart(product)">
                                    <el-icon>
                                        <ShoppingCart />
                                    </el-icon> 加入购物车
                                </el-button>
                                <el-button type="danger" size="large">
                                    立即购买
                                </el-button>
                            </div>
                        </div>

                        <div class="product-tags">
                            <el-tag type="info">{{ product.tag }}</el-tag>
                        </div>
                    </div>
                </el-col>
            </el-row>

            <!-- 商品详情 -->
            <div class="product-content">
                <el-tabs>
                    <el-tab-pane label="产品详情" name="details">
                        <div class="product-detail-content">
                            <p>{{ product.description }}</p>
                            <p>产品详情：</p>
                            <ul>
                                <li>{{ product.details }}</li>
                            </ul>
                        </div>
                    </el-tab-pane>
                    <el-tab-pane label="用户评价" name="reviews">
                        <div class="reviews">
                            <div class="review-item">
                                <div class="review-header">
                                    <el-avatar />
                                    <div class="user-info">
                                        <span class="username">用户123</span>

                                        <el-rate disabled />
                                    </div>
                                    <span class="date">2025-01-01</span>

                                </div>
                                <p class="content">这是一个情感类产品，专注于情感的表达和沟通。</p>
                            </div>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.product-detail {

    .fallback-alert {
        margin-bottom: 15px;
    }

    max-width: 1200px;
    margin: 20px auto;
    padding: 0 20px;

    .el-page-header {
        margin-bottom: 20px;
    }

    .product-container {
        background: #fff;
        border-radius: 8px;
        padding: 30px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    }

    .product-gallery {
        .main-image {
            width: 100%;
            height: 500px;
            border-radius: 8px;
            margin-bottom: 15px;
            object-fit: contain;
            background-color: #f8f9fc;
        }

        .thumbnails {
            display: flex;
            gap: 10px;

            .thumbnail {
                width: 80px;
                height: 80px;
                border-radius: 4px;
                cursor: pointer;
                border: 2px solid transparent;
                transition: all 0.3s;

                &:hover,
                &.active {
                    border-color: #4e73df;
                }
            }
        }
    }

    .product-info {
        .product-title {
            font-size: 28px;
            margin-bottom: 15px;
            color: #333;
        }

        .product-meta {
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;

            .rating {
                display: flex;
                align-items: center;
                margin-bottom: 15px;

                .el-rate {
                    margin-right: 15px;
                }

                .sales {
                    color: #999;
                }
            }

            .price-section {
                display: flex;
                align-items: center;
                margin-bottom: 15px;

                .current-price {
                    font-size: 32px;
                    font-weight: bold;
                    color: #e74a3b;
                    margin-right: 15px;
                }

                .original-price {
                    font-size: 18px;
                    color: #999;
                    text-decoration: line-through;
                    margin-right: 15px;
                }
            }

            .promotions {
                .promo-tag {
                    margin-right: 10px;
                    font-weight: bold;
                }
            }
        }

        .product-description {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;

            h3 {
                font-size: 18px;
                margin-bottom: 10px;
                color: #333;
            }

            p {
                color: #666;
                line-height: 1.8;
            }
        }

        .product-actions {
            margin-bottom: 25px;

            .quantity {
                display: flex;
                align-items: center;
                margin-bottom: 20px;

                span {
                    margin-right: 15px;
                    font-size: 16px;
                }
            }

            .buttons {
                display: flex;
                gap: 15px;

                .el-button {
                    flex: 1;
                    font-weight: bold;
                }
            }
        }

        .product-tags {
            .el-tag {
                margin-right: 10px;
                margin-bottom: 10px;
            }
        }
    }

    .product-content {
        margin-top: 40px;
    }

    .reviews {
        .review-item {
            padding: 20px 0;
            border-bottom: 1px solid #eee;

            .review-header {
                display: flex;
                align-items: center;
                margin-bottom: 15px;

                .el-avatar {
                    margin-right: 15px;
                }

                .user-info {
                    flex: 1;

                    .username {
                        font-weight: bold;
                        display: block;
                        margin-bottom: 5px;
                    }
                }

                .date {
                    color: #999;
                    font-size: 14px;
                }
            }

            .content {
                color: #555;
                line-height: 1.6;
                margin: 0;
            }
        }
    }
}
</style>