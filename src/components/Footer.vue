<script setup>
import { 
  Location, 
  Phone, 
  Message, 
  ChatDotRound, 
  ChatDotSquare,
  Iphone 
} from '@element-plus/icons-vue'
</script>

<template>
    <footer class="app-footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>关于我们</h3>
                    <p>VirtualStore是专业的虚拟产品销售平台,致力于为用户提供优质的虚拟产品服务。</p>
                    <p>我们的使命是为用户提供便捷、安全、优质的虚拟产品交易体验。</p>
                </div>

                <div class="footer-section">
                    <h3>产品分类</h3>
                    <ul>
                        <li><a href="#">软件应用</a></li>
                        <li><a href="#">游戏充值</a></li>
                        <li><a href="#">在线课程</a></li>
                        <li><a href="#">设计素材</a></li>
                        <li><a href="#">会员服务</a></li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h3>帮助中心</h3>
                    <ul>
                        <li><a href="#">常见问题</a></li>
                        <li><a href="#">支付方式</a></li>
                        <li><a href="#">退款政策</a></li>
                        <li><a href="#">用户协议</a></li>
                        <li><a href="#">隐私政策</a></li>
                    </ul>
                </div>

                <div class="footer-section" contact>
                    <h3>联系我们</h3>
                    <p><el-icon>
                            <Location />
                        </el-icon> 广东省深圳市龙岗区莫氏集团</p>
                    <p><el-icon>
                            <Phone />
                        </el-icon> 400-123-4567</p>
                    <p><el-icon>
                            <Message />
                        </el-icon> mgn@virtualstore.com</p>

                    <div class="social-links">
                        <a href="#"><el-icon size="24">
                                <ChatDotRound />
                            </el-icon></a>
                        <a href="#"><el-icon size="24">
                                <ChatDotSquare />
                            </el-icon></a>
                        <a href="#"><el-icon size="24">
                                <Iphone />
                            </el-icon></a>
                    </div>
                </div>
            </div>
            <div class="copyright">
                <p>© 2025 VirtualStore 虚拟产品商城 版权所有</p>
                <p>粤ICP备12345678号-1</p>
            </div>
        </div>
    </footer>

</template>

<style lang="scss" scoped>
.app-footer {
    background-color: #2e3a4e;
    color: #fff;
    padding: 50px 0 20px;

    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
    }

    .footer-content {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 30px;
        margin-bottom: 40px;
    }

    .footer-section {
        h3 {
            font-size: 18px;
            margin-bottom: 20px;
            position: relative;
            padding-bottom: 10px;

            &::after {
                content: '';
                position: absolute;
                left: 0;
                bottom: 0;
                width: 40px;
                height: 2px;
                background: #4e73df;
            }
        }

        p {
            color: #a3a9b8;
            line-height: 1.8;
            margin-bottom: 15px;
        }

        ul {
            list-style: none;
            padding: 0;

            li {
                margin-bottom: 10px;

                a {
                    color: #a3a9b8;
                    text-decoration: none;
                    transition: all 0.3s;

                    &:hover {
                        color: #4e73df;
                        padding-left: 5px;
                    }
                }
            }
        }

        &.contact {
            p {
                display: flex;
                align-items: center;

                .el-icon {
                    margin-right: 10px;
                    font-size: 18px;
                }
            }
        }
    }

    .social-links {
        display: flex;
        gap: 15px;
        margin-top: 20px;

        a {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            transition: all 0.3s;

            &:hover {
                background: #4e73df;
                transform: translateY(-3px);
            }

            .el-icon {
                color: #fff;
            }
        }
    }

    .copyright {
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        padding-top: 20px;
        text-align: center;
        color: #a3a9b8;
        font-size: 14px;

        p {
            margin: 5px 0;
        }
    }
}
</style>
