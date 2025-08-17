<script setup>
import { ShoppingCart } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const logout = () => {
    userStore.logout()
    router.push('/login')
}
</script>
<template>
    <header class="app-header">
        <div class="container">
            <div class="logo" @click="$router.push('/')">
                <img src="@/assets/logo.png" alt="VirtualStore">
                <span>VirtualStore</span>
            </div>

            <div class="search-bar">
                <el-input v-model="searchKeyword" placeholder="搜索虚拟产品..." size="large">
                    <template #append>
                        <el-button icon="Search" />
                    </template>
                </el-input>
            </div>

            <div class="nav-buttons">
                <el-button type="text" @click="$router.push('/cart')">
                    <el-badge class="badge">
                        <el-icon :size="24">
                            <ShoppingCart />
                        </el-icon>
                    </el-badge>
                    <span class="text">购物车</span>
                </el-button>

                <el-dropdown v-if="userStore.isLoggedIn">
                    <div class="user-avatar">
                        <el-avatar :size="36" :src="userStore.avatar" />
                        <span class="username">{{ userStore.username }}</span>
                    </div>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item>个人中心</el-dropdown-item>
                            <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>

                <div v-else class="auth-buttons">
                    <el-button type="text" @click="$router.push('/login')">登录</el-button>
                    <el-button type="primary" size="small" @click="$router.push('/register')">注册</el-button>
                </div>
            </div>
        </div>
    </header>
</template>

<style lang="scss" scoped>
.app-header {
    background-color: #fff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
    padding: 15px 0;

    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .logo {
        display: flex;
        align-items: center;
        cursor: pointer;

        img {
            height: 40px;
            margin-right: 10px;
            border-radius: 5px;
        }

        span {
            font-size: 20px;
            font-weight: bold;
            color: #4e73df;
        }
    }

    .search-bar {
        flex: 1;
        max-width: 500px;
        margin: 0 30px;
    }

    .nav-buttons {
        display: flex;
        align-items: center;
        gap: 20px;

        .badge {
            margin-right: 5px;
        }

        .text {
            margin-left: 5px;
            font-size: 14px;
        }

        .user-avatar {
            display: flex;
            align-items: center;
            cursor: pointer;

            .username {
                margin-left: 10px;
                font-size: 14px;
            }
        }

        .auth-buttons {
            display: flex;
            gap: 10px;
            align-items: center;
        }
    }
}
</style>