// 静态兜底数据：后端不可用时前端展示的内置数据（与 db/seed.sql 对齐）
import { resolveImage } from '@/utils/image'

const rawCategories = [
    { id: 1, name: '软件', icon: 'Coin' },
    { id: 2, name: '虚拟物品', icon: 'CreditCard' },
    { id: 3, name: '课程', icon: 'Tickets' },
    { id: 4, name: '素材', icon: 'Picture' },
    { id: 5, name: '影视', icon: 'VideoCameraFilled' },
    { id: 6, name: '音乐', icon: 'Headset' },
    { id: 7, name: '模板', icon: 'Document' },
]

const rawProducts = [
    { id: 1, name: 'PS 2025 大师版', description: 'Photoshop 2025 永久授权，支持 AI 智能抠图与云端协作', details: '包含完整安装包、激活工具、中文汉化包与安装视频教程，支持 Win/Mac 双平台', price: 199, originalPrice: 299, image: 'images/products/ps.jpg', categoryId: 1, tag: '正版授权', status: 'on', sales: 328, rating: 4.9, deliveryContent: '购买后立即在订单页获取下载链接与激活教程' },
    { id: 2, name: 'Office 全家桶', description: 'Office 365 家庭版一年订阅，含 Word/Excel/PPT', details: '官方正版订阅，支持 5 台设备，含 1TB OneDrive 云存储', price: 259, originalPrice: 399, image: 'images/products/icons.jpg', categoryId: 1, tag: '官方订阅', status: 'on', sales: 156, rating: 4.8, deliveryContent: '购买后自动发放兑换码，凭码官网兑换激活' },
    { id: 3, name: 'Q币充值卡', description: 'Q币充值 100 元面额，秒到账', details: '支持 QQ 会员、游戏、装扮等腾讯系消费，自动充值到账号', price: 95, originalPrice: 100, image: 'images/products/Virtual_ currency.jpg', categoryId: 2, tag: '秒到账', status: 'on', sales: 894, rating: 4.9, deliveryContent: '付款后自动充值，请在下单页填写 QQ 账号' },
    { id: 4, name: '游戏点卡', description: '主流游戏点卡充值，支持 Steam/Epic 等', details: 'Steam 钱包充值码、Epic 礼品卡，付款后发放卡密', price: 98, originalPrice: 100, image: 'images/products/pig6.jpg', categoryId: 2, tag: '卡密直发', status: 'on', sales: 467, rating: 4.7, deliveryContent: '订单完成后自动生成卡密，复制即用' },
    { id: 5, name: '前端进阶实战课', description: 'Vue3 + Vite 从入门到企业级项目实战', details: '100 节视频课 + 源码 + 面试题手册，永久回放', price: 399, originalPrice: 699, image: 'images/products/video.jpg', categoryId: 3, tag: '限时 5 折', status: 'on', sales: 203, rating: 4.9, deliveryContent: '付款后开通学习账号，自动发放课程兑换码' },
    { id: 6, name: 'Python 数据分析课', description: 'Python 数据分析与可视化零基础到精通', details: '80 节精讲视频 + 数据集 + 练习代码，含直播答疑', price: 299, originalPrice: 499, image: 'images/products/picture.jpg', categoryId: 3, tag: '热门课程', status: 'on', sales: 178, rating: 4.8, deliveryContent: '付款后自动开通课程权限，凭码进入学习平台' },
    { id: 7, name: '设计素材大礼包', description: '10000+ 高清设计素材，含字体/图标/样机', details: '包含免商字体包、图标库、UI 样机、海报模板，持续更新', price: 129, originalPrice: 259, image: 'images/products/picture.jpg', categoryId: 4, tag: '免商可用', status: 'on', sales: 512, rating: 4.8, deliveryContent: '付款后获得网盘下载链接与解压密码' },
    { id: 8, name: '图标图标库', description: '3000+ 矢量图标库，支持 Figma/Sketch/AI', details: '全套图标含 PNG/SVG/Figma 源文件，分类齐全可检索', price: 89, originalPrice: 169, image: 'images/products/icons.jpg', categoryId: 4, tag: '矢量源文件', status: 'on', sales: 324, rating: 4.7, deliveryContent: '付款后自动发放下载链接' },
    { id: 9, name: '4K 电影合集', description: '经典大片 4K 修复版合集，持续更新', details: '含 200+ 部经典电影 4K 资源，蓝光原盘画质', price: 69, originalPrice: 129, image: 'images/products/video.jpg', categoryId: 5, tag: '蓝光画质', status: 'on', sales: 689, rating: 4.6, deliveryContent: '付款后获取网盘链接，支持在线转存' },
    { id: 10, name: '高分纪录片', description: '自然/人文/科技高分纪录片 50 部合集', details: 'BBC/Netflix 高分纪录片精选，中英双语字幕', price: 59, originalPrice: 119, image: 'images/products/pig6.jpg', categoryId: 5, tag: '双语字幕', status: 'on', sales: 431, rating: 4.7, deliveryContent: '付款后自动发放下载链接' },
    { id: 11, name: '无损音乐包', description: '10000+ 首无损音乐，含华语/欧美/纯音乐', details: 'FLAC 无损格式，含歌单整理与封面信息', price: 79, originalPrice: 149, image: 'images/products/music.jpg', categoryId: 6, tag: 'FLAC 无损', status: 'on', sales: 356, rating: 4.8, deliveryContent: '付款后获得网盘链接' },
    { id: 12, name: '音乐制作套装', description: 'FL Studio 编曲软件 + 音色库合集', details: '含宿主软件安装包、音源插件、教程视频', price: 399, originalPrice: 599, image: 'images/products/logo.png', categoryId: 6, tag: '专业套装', status: 'on', sales: 89, rating: 4.9, deliveryContent: '付款后自动发放下载链接与安装教程' },
    { id: 13, name: '企业网站模板', description: '响应式企业官网 HTML 模板，可直接部署', details: '含 20 套不同行业模板，手机端自适应，代码开源', price: 159, originalPrice: 299, image: 'images/products/website_ template.jpg', categoryId: 7, tag: '响应式', status: 'on', sales: 267, rating: 4.8, deliveryContent: '付款后下载源码包，含部署文档' },
    { id: 14, name: 'PPT 商务模板', description: '500+ 套商务 PPT 模板，职场必备', details: '含图表、图示、封面页模板，支持 WPS/Office', price: 49, originalPrice: 99, image: 'images/products/ps.jpg', categoryId: 7, tag: '即下即用', status: 'on', sales: 745, rating: 4.6, deliveryContent: '付款后自动发放下载链接' },
    { id: 15, name: 'Windows 系统工具包', description: '系统优化/激活/备份工具集合', details: '含系统激活工具、驱动管理、垃圾清理等常用工具', price: 29, originalPrice: 59, image: 'images/products/icons.jpg', categoryId: 1, tag: '装机必备', status: 'on', sales: 1023, rating: 4.5, deliveryContent: '付款后自动发放下载链接' },
    { id: 16, name: '影视会员月卡', description: '主流视频平台会员月卡（爱优腾任选）', details: '官方直充，支持爱奇艺/优酷/腾讯视频会员', price: 25, originalPrice: 30, image: 'images/products/video.jpg', categoryId: 2, tag: '官方直充', status: 'on', sales: 1567, rating: 4.9, deliveryContent: '付款后自动充值，请在下单页填写账号' },
]

export const fallbackCategories = rawCategories.map((c) => ({ ...c }))

export const fallbackProducts = rawProducts.map((p) => ({
    ...p,
    price: Number(p.price),
    originalPrice: Number(p.originalPrice),
    image: resolveImage(p.image),
}))

export const fallbackHealth = { status: 'OK', database: 'offline', fallback: true }
