<script setup>
import { ref } from 'vue';
import { Check, Message, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import api from '@/api/index';

const router = useRouter()
const userStore = useUserStore()

const form = ref({
    email: '',
    password: ''
})

const rememberMe = ref(false)
const loading = ref(false)

const rules = ref({
    email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
    ]
})

// 登录
// const handleLogin = () => {
//     loading.value = true
//     setTimeout(() => {
//         const users = JSON.parse(localStorage.getItem('users')) || []
//         const user = users.find(user => user.email === form.value.email)

//         if (user && user.password === form.value.password) {
//             userStore.Login({
//                 username: user.username,
//                 email: user.email,
//                 avatar: user.avatar
//             })
//             router.push('/')
//         } else {
//             ElMessage.error('邮箱或密码错误')
//         }
//         loading.value = false
//     }, 1000)
// }

// 登录
const handleLogin = async () => {
    loading.value = true;
    try {
        // 发送登录请求
        const response = await api.post('/login', {
            email: form.value.email,
            password: form.value.password
        });

        // 登录成功后保存用户信息
        userStore.Login({
            id: response.data.id,
            username: response.data.username,
            email: response.data.email,
            avatar: response.data.avatar
        });

        router.push('/');
    } catch (error) {
        // 显示详细的错误信息
        const errorMsg = error.response?.data?.message || '登录失败，请稍后再试';
        ElMessage.error(errorMsg);

        // 添加调试日志
        console.error('登录错误详情:', {
            request: { email: form.value.email },
            response: error.response,
            error
        });
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="login-container">
        <div class="login-form">
            <div class="form-header">
                <h2>欢迎回来</h2>
                <p>请登录您的账号</p>
            </div>

            <el-form ref="loginForm" :model="form" :rules="rules" label-position="top" @submit.prevent="handleLogin">
                <el-form-item label="电子邮箱" prop="email">
                    <el-input v-model="form.email" placeholder="请输入邮箱地址" size="large" prefix-icon="Message" />
                </el-form-item>

                <el-form-item label="密码" prop="password">
                    <el-input v-model="form.password" type="password" placeholder="请输入密码" size="large"
                        prefix-icon="Lock" show-password />
                </el-form-item>

                <div class="form-options">
                    <el-checkbox v-model="rememberMe">记住我</el-checkbox>
                    <el-link type="primary" :underline="false">忘记密码?</el-link>
                </div>

                <el-button type="primary" size="large" class="login-btn" native-type="submit" :loading="loading">
                    登录
                </el-button>

                <div class="form-footer">
                    <span>还没有账号?</span>
                    <el-link type="primary" :underline="false" @click="$router.push('/register')">
                        立即注册
                    </el-link>
                </div>
            </el-form>
        </div>

        <div class="login-banner">
            <div class="banner-content">
                <h1>VirtualStore</h1>
                <p>专业的虚拟产品交易平台</p>
                <div class="features">
                    <p><el-icon>
                            <Check />
                        </el-icon> 安全交易保障</p>
                    <p><el-icon>
                            <Check />
                        </el-icon> 即时产品交付</p>
                    <p><el-icon>
                            <Check />
                        </el-icon> 7天无忧退款</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.login-container {
    display: flex;
    min-height: 100vh;

    .login-form {
        flex: 1;
        max-width: 500px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 40px;
        background: #fff;

        .form-header {
            text-align: center;
            margin-bottom: 30px;

            h2 {
                font-size: 28px;
                margin-bottom: 10px;
                color: #333;
            }

            p {
                color: #666;
            }
        }

        .form-options {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
        }

        .login-btn {
            width: 100%;
            margin-top: 10px;
            font-size: 16px;
            font-weight: 500;
        }

        .form-footer {
            text-align: center;
            margin-top: 30px;
            color: #666;

            .el-link {
                margin-left: 5px;
            }
        }
    }

    .login-banner {
        flex: 1;
        background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        padding: 40px;

        .banner-content {
            max-width: 500px;

            h1 {
                font-size: 42px;
                margin-bottom: 20px;
            }

            p {
                font-size: 18px;
                margin-bottom: 30px;
                opacity: 0.9;
            }

            .features {
                p {
                    display: flex;
                    align-items: center;
                    font-size: 16px;
                    margin-bottom: 15px;

                    .el-icon {
                        margin-right: 10px;
                    }
                }
            }
        }
    }
}

@media (max-width: 768px) {
    .login-container {
        flex-direction: column;

        .login-banner {
            display: none;
        }

        .login-form {
            max-width: 100%;
            padding: 20px;
        }
    }
}
</style>
