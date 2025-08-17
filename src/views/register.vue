<script setup>
import { ref, render } from 'vue';
import { Plus, Message, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import api from '@/api/index';

const router = useRouter()

// 表单数据
const form = ref({
    id: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreement: false,
    avatarFile: null
})

const loading = ref(false)
// 表单实例
const formRef = ref(null)
// 头像预览
const avatarPreview = ref(null)
// 允许的图片类型
const allowedImageTypes = ref('image/jpeg,image/png,image/gif,image/webp')

// 表单校验规则
const rules = ref({
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 2, max: 10, message: '用户名长度必须在2-10个字符之间', trigger: 'blur' }
    ],
    email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度必须在6-20个字符之间', trigger: 'blur' },
        { pattern: /^[a-zA-Z0-9]+$/, message: '密码只能包含字母和数字', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (value !== form.value.password) {
                    callback(new Error('两次输入密码不一致'))
                } else {
                    callback()
                }
            },
            trigger: 'blur'
        }
    ],
    agreement: [
        { required: true, message: '请同意用户协议和隐私政策', trigger: 'change' },
        {
            validator: (rule, value, callback) => {
                if (!value) {
                    callback(new Error('请同意用户协议和隐私政策'))
                } else {
                    callback()
                }
            },
            trigger: 'change'
        }
    ]
})

// const saveToLocalStorage = (userData) => {
//     try {
//         const users = JSON.parse(localStorage.getItem('users')) || [];
//         // 箭头函数体被大括号包围，但内部没有 `return` 语句，因此实际上这个箭头函数返回的是 `undefined` 
//         // 方法:1.去掉大括号，2.添加return
//         const isExist = users.some(user =>
//             user.username.toLowerCase() === userData.username.toLowerCase() || user.email.toLowerCase() === userData.email.toLowerCase()
//         )

//         if (isExist) {
//             ElMessage.error('用户名或邮箱已存在')
//             return false
//         }

//         users.push(userData)
//         localStorage.setItem('users', JSON.stringify(users))
//         return true
//     } catch (error) {
//         console.log(error);
//         return false
//     }
// }

// 注册
// const handleRegister = (e) => {
//     e.preventDefault()
//     formRef.value.validate((valid) => {
//         if (valid) {
//             loading.value = true

//             const userData = {
//                 id: Date.now(),
//                 username: form.value.username,
//                 email: form.value.email,
//                 password: form.value.password,
//                 avatar: form.value.avatar || userStore.getDefaultAvatar(),
//             }

//             const saved = saveToLocalStorage(userData)

//             if (saved) {
//                 setTimeout(() => {
//                     ElMessage.success("注册成功")
//                     router.push('/')
//                     loading.value = false;
//                 }, 1500)
//             } else {
//                 loading.value = false
//                 ElMessage.error("注册失败")

//             }
//         } else {
//             ElMessage.error("请填写完整信息")
//         }
//     })
// }

// 注册
const handleRegister = async (e) => {
    e.preventDefault()
    formRef.value.validate(async (valid) => {
        if (valid) {
            loading.value = true

            // 创建FormData对象
            const formData = new FormData()
            formData.append('username', form.value.username)
            formData.append('email', form.value.email)
            formData.append('password', form.value.password)

            // 如果有头像文件则添加
            if (form.value.avatarFile) {
                formData.append('avatar', form.value.avatarFile)
            }

            try {
                // 发送注册请求
                const response = await api.post('/register', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })

                ElMessage.success('注册成功')
                router.push('/login')
            } catch (error) {
                ElMessage.error(error.response?.data?.message || '注册失败')
            } finally {
                loading.value = false
            }
        } else {
            ElMessage.error('请填写完整信息')
        }
    })
}

// 头像上传
const handleAvatarChange = (file) => {
    // 1. 检查文件对象是否存在
    if (!file || !file.raw) {
        ElMessage.error('请重新选择头像')
        return false
    }
    // 2. 检查文件类型是否存在
    if (!file.raw.type) {
        ElMessage.error('无法识别文件类型')
        return false
    }
    // 3. 检查文件类型
    const isImage = file.raw.type.startsWith('image/')
    const isSizeValid = file.raw.size <= 1024 * 1024 * 100

    if (!isImage) {
        ElMessage.error('请上传图片文件')
        return false
    }
    if (!isSizeValid) {
        ElMessage.error('图片大小不超过100MB')
        return false
    }

    form.value.avatarFile = file.raw

    const reader = new FileReader()
    reader.onload = (e) => {
        avatarPreview.value = e.target.result
        form.value.avatar = e.target.result
    }
    reader.onerror = () => {
        ElMessage.error('图片读取失败，请重试')
        avatarPreview.value = null
        form.value.avatar = null
    }
    reader.readAsDataURL(file.raw)
}
</script>

<template>
    <div class="register-container">
        <div class="register-form">
            <div class="form-header">
                <h2>创建账号</h2>
                <p>加入VirtualStore,开启您的虚拟产品购物之旅</p>
            </div>

            <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="handleRegister">
                <!-- 头像上传 -->
                <el-form-item label="头像" prop="avatar">
                    <div class="avatar-upload">
                        <el-upload class="avatar-uploader" action="" :show-file-list="false" :auto-upload="false"
                            :on-change="handleAvatarChange" :accept="allowedImageTypes">
                            <img v-if="avatarPreview" :src="avatarPreview" class="avatar" />
                            <div v-else class="avatar-placeholder">
                                <el-icon :size="40">
                                    <Plus />
                                </el-icon>
                                <p>点击上传头像</p>
                            </div>
                        </el-upload>
                        <div class="avatar-tips">
                            <p>支持JPG/PNG/GIF/WEBP格式，大小不超过100MB</p>
                            <p>建议尺寸：200×200像素</p>
                        </div>
                    </div>
                </el-form-item>
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="form.username" placeholder="请输入用户名" type="text" size="large"
                        prefix-icon="User"></el-input>
                </el-form-item>
                <el-form-item label="电子邮箱" prop="email">
                    <el-input v-model="form.email" placeholder="请输入邮箱地址" size="large" prefix-icon="Message" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="form.password" placeholder="请输入密码" type="password" size="large"
                        prefix-icon="Lock" show-password></el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input v-model="form.confirmPassword" placeholder="请确认密码" type="password" size="large"
                        prefix-icon="Lock" show-password></el-input>
                </el-form-item>
                <el-form-item prop="agreement">
                    <el-checkbox v-model="form.agreement">
                        我已阅读并同意<el-link type="primary" :underline="false">用户协议</el-link>和<el-link type="primary"
                            :underline="false">隐私政策</el-link>
                    </el-checkbox>
                </el-form-item>
                <el-button type="primary" size="large" class="register-btn" native-type="submit" :loading="loading">
                    注册
                </el-button>
                <div class="form-footer">
                    <span>已有账号?</span>
                    <el-link type="primary" :underline="false" @click="$router.push('/login')">
                        立即登录
                    </el-link>
                </div>
            </el-form>
        </div>
        <div class="register-banner">
            <div class="banner-content">
                <h1>加入VirtualStore</h1>
                <p>享受以下会员权益</p>
                <div class="benefits">
                    <div class="benefit-item">
                        <el-icon>
                            <Discount />
                        </el-icon>
                        <div>
                            <h3>专属折扣</h3>
                            <p>会员专享商品折扣</p>
                        </div>
                    </div>
                    <div class="benefit-item">
                        <el-icon>
                            <Present />
                        </el-icon>
                        <div>
                            <h3>会员礼包</h3>
                            <p>注册即送新人礼包</p>
                        </div>
                    </div>
                    <div class="benefit-item">
                        <el-icon>
                            <Coin />
                        </el-icon>
                        <div>
                            <h3>积分奖励</h3>
                            <p>购物获取积分兑换好礼</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.register-container {
    display: flex;
    min-height: 100vh;

    .register-form {
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

        .avatar-upload {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;

            .avatar-uploader {
                width: 120px;
                height: 120px;
                border: 1px dashed #d9d9d9;
                border-radius: 50%;
                cursor: pointer;
                position: relative;
                overflow: hidden;
                transition: border-color 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;

                &:hover {
                    border-color: #409EFF;
                }

                img.avatar {
                    width: 120px;
                    height: 120px;
                    object-fit: cover;
                    border-radius: 50%;
                }

                .avatar-placeholder {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                    color: #8c939d;
                    font-size: 12px;
                    line-height: 1.5;

                    .el-icon {
                        margin-bottom: 8px;
                    }
                }
            }

            // 上传提示
            .avatar-tips {
                text-align: center;
                color: #999;
                font-size: 12px;
                line-height: 1.6;
            }
        }

        .register-btn {
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

    .register-banner {
        flex: 1;
        background: linear-gradient(135deg, #1cc88a 0%, #13855c 100%);
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
                margin-bottom: 40px;
                opacity: 0.9;
            }

            .benefits {
                .benefit-item {
                    display: flex;
                    align-items: flex-start;
                    margin-bottom: 30px;

                    .el-icon {
                        font-size: 36px;
                        margin-right: 15px;
                        background: rgba(255, 255, 255, 0.2);
                        border-radius: 50%;
                        padding: 10px;
                    }

                    h3 {
                        font-size: 20px;
                        margin-bottom: 5px;
                    }

                    p {
                        margin: 0;
                        opacity: 0.8;
                        font-size: 16px;
                    }
                }
            }
        }
    }
}

@media (max-width: 768px) {
    .register-container {
        flex-direction: column;

        .register-banner {
            display: none;
        }

        .register-form {
            max-width: 100%;
            padding: 20px;
        }
    }
}
</style>
