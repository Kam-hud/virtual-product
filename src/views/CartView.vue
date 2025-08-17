<script setup>
import { ShoppingCart } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

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
            <el-button type="text" @click="clearCart">清空购物车</el-button>
        </div>

        <div>
            <el-table style="width: 100%;">
                <el-table-column width="60">
                    <template>
                        <el-checkbox />
                    </template>
                </el-table-column>
                <el-table-column label="商品信息" width="500">
                    <template>
                        <div class="product-info">
                            <el-image class="product-image" />
                            <div class="product-details">
                                <h3 class="product-name">楠总唯一深情课程</h3>
                                <div class="product-tags">
                                    <el-tag type="info" size="small">课程</el-tag>
                                </div>
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="单价" width="120">
                    <template>999</template>
                </el-table-column>
                <el-table-column label="数量" width="150">
                    <template>
                        <el-input-number :min="1" :max="10" size="small" />
                    </template>
                </el-table-column>
                <el-table-column label="小计" width="120">
                    <template>
                        <span class="subtotal">¥9999</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="80">
                    <template>
                        <el-button type="danger" icon="el-icon-delete" circle size="small" />
                    </template>
                </el-table-column>
            </el-table>
            <div class="cart-summary">
                <div class="summary-left">
                    <el-checkbox>全选</el-checkbox>
                    <span class="selected-count">已选择 2 件商品</span>
                </div>
                <div class="summary-right">
                    <div class="total">
                        <span class="label">合计：</span>
                        <span class="amount">¥19998</span>
                    </div>
                    <el-button type="danger" size="large" @click="checkout">结算</el-button>
                </div>
            </div>
            <div>
                <el-empty description="您的购物车还是空的">
                    <el-button type="primary" @click="goShopping">去逛逛</el-button>
                </el-empty>
            </div>
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
