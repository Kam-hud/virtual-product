-- VirtualStore 种子数据（PostgreSQL 方言，兼容 Supabase）
-- 依赖 db/schema.sql 已执行
-- 账号：admin@virtualstore.com / admin123456（管理员）、test@virtualstore.com / test123456（普通用户）
-- 密码为 bcrypt 哈希（cost=10）

-- 分类（7 个真实分类，前端额外加"全部"）
INSERT INTO category (id, name, icon, sort) VALUES
(1, '软件', 'Coin', 1),
(2, '虚拟物品', 'CreditCard', 2),
(3, '课程', 'Tickets', 3),
(4, '素材', 'Picture', 4),
(5, '影视', 'VideoCameraFilled', 5),
(6, '音乐', 'Headset', 6),
(7, '模板', 'Document', 7);

SELECT setval('category_id_seq', 7, true);

-- 用户（admin + test）
INSERT INTO users (id, username, email, password_hash, avatar, role) VALUES
(1, 'admin', 'admin@virtualstore.com', '$2b$10$RME3TyMyxWraUNd0P9oMtu7PNJjs4m8R2J/ZyzzOFtqRuXrpG4e/u', 'images/products/logo.png', 'admin'),
(2, 'test', 'test@virtualstore.com', '$2b$10$n93LuBUSd3bgJ0G0MnYST.aViaJGvYaIfm7Qhh7Yy0Wki8Mn51bb2', 'images/products/logo.png', 'user');

SELECT setval('users_id_seq', 2, true);

-- 商品（16 个，覆盖 7 分类）
INSERT INTO product (id, name, description, details, price, original_price, image, category_id, tag, status, sales, rating, delivery_content) VALUES
(1, 'PS 2025 大师版', 'Photoshop 2025 永久授权，支持 AI 智能抠图与云端协作', '包含完整安装包、激活工具、中文汉化包与安装视频教程，支持 Win/Mac 双平台', 199.00, 299.00, 'images/products/ps.jpg', 1, '正版授权', 'on', 328, 4.9, '购买后立即在订单页获取下载链接与激活教程'),
(2, 'Office 全家桶', 'Office 365 家庭版一年订阅，含 Word/Excel/PPT', '官方正版订阅，支持 5 台设备，含 1TB OneDrive 云存储', 259.00, 399.00, 'images/products/icons.jpg', 1, '官方订阅', 'on', 156, 4.8, '购买后自动发放兑换码，凭码官网兑换激活'),
(3, 'Q币充值卡', 'Q币充值 100 元面额，秒到账', '支持 QQ 会员、游戏、装扮等腾讯系消费，自动充值到账号', 95.00, 100.00, 'images/products/Virtual_ currency.jpg', 2, '秒到账', 'on', 894, 4.9, '付款后自动充值，请在下单页填写 QQ 账号'),
(4, '游戏点卡', '主流游戏点卡充值，支持 Steam/Epic 等', 'Steam 钱包充值码、Epic 礼品卡，付款后发放卡密', 98.00, 100.00, 'images/products/pig6.jpg', 2, '卡密直发', 'on', 467, 4.7, '订单完成后自动生成卡密，复制即用'),
(5, '前端进阶实战课', 'Vue3 + Vite 从入门到企业级项目实战', '100 节视频课 + 源码 + 面试题手册，永久回放', 399.00, 699.00, 'images/products/video.jpg', 3, '限时 5 折', 'on', 203, 4.9, '付款后开通学习账号，自动发放课程兑换码'),
(6, 'Python 数据分析课', 'Python 数据分析与可视化零基础到精通', '80 节精讲视频 + 数据集 + 练习代码，含直播答疑', 299.00, 499.00, 'images/products/picture.jpg', 3, '热门课程', 'on', 178, 4.8, '付款后自动开通课程权限，凭码进入学习平台'),
(7, '设计素材大礼包', '10000+ 高清设计素材，含字体/图标/样机', '包含免商字体包、图标库、UI 样机、海报模板，持续更新', 129.00, 259.00, 'images/products/picture.jpg', 4, '免商可用', 'on', 512, 4.8, '付款后获得网盘下载链接与解压密码'),
(8, '图标图标库', '3000+ 矢量图标库，支持 Figma/Sketch/AI', '全套图标含 PNG/SVG/Figma 源文件，分类齐全可检索', 89.00, 169.00, 'images/products/icons.jpg', 4, '矢量源文件', 'on', 324, 4.7, '付款后自动发放下载链接'),
(9, '4K 电影合集', '经典大片 4K 修复版合集，持续更新', '含 200+ 部经典电影 4K 资源，蓝光原盘画质', 69.00, 129.00, 'images/products/video.jpg', 5, '蓝光画质', 'on', 689, 4.6, '付款后获取网盘链接，支持在线转存'),
(10, '高分纪录片', '自然/人文/科技高分纪录片 50 部合集', 'BBC/Netflix 高分纪录片精选，中英双语字幕', 59.00, 119.00, 'images/products/pig6.jpg', 5, '双语字幕', 'on', 431, 4.7, '付款后自动发放下载链接'),
(11, '无损音乐包', '10000+ 首无损音乐，含华语/欧美/纯音乐', 'FLAC 无损格式，含歌单整理与封面信息', 79.00, 149.00, 'images/products/music.jpg', 6, 'FLAC 无损', 'on', 356, 4.8, '付款后获得网盘链接'),
(12, '音乐制作套装', 'FL Studio 编曲软件 + 音色库合集', '含宿主软件安装包、音源插件、教程视频', 399.00, 599.00, 'images/products/logo.png', 6, '专业套装', 'on', 89, 4.9, '付款后自动发放下载链接与安装教程'),
(13, '企业网站模板', '响应式企业官网 HTML 模板，可直接部署', '含 20 套不同行业模板，手机端自适应，代码开源', 159.00, 299.00, 'images/products/website_ template.jpg', 7, '响应式', 'on', 267, 4.8, '付款后下载源码包，含部署文档'),
(14, 'PPT 商务模板', '500+ 套商务 PPT 模板，职场必备', '含图表、图示、封面页模板，支持 WPS/Office', 49.00, 99.00, 'images/products/ps.jpg', 7, '即下即用', 'on', 745, 4.6, '付款后自动发放下载链接'),
(15, 'Windows 系统工具包', '系统优化/激活/备份工具集合', '含系统激活工具、驱动管理、垃圾清理等常用工具', 29.00, 59.00, 'images/products/icons.jpg', 1, '装机必备', 'on', 1023, 4.5, '付款后自动发放下载链接'),
(16, '影视会员月卡', '主流视频平台会员月卡（爱优腾任选）', '官方直充，支持爱奇艺/优酷/腾讯视频会员', 25.00, 30.00, 'images/products/video.jpg', 2, '官方直充', 'on', 1567, 4.9, '付款后自动充值，请在下单页填写账号');

SELECT setval('product_id_seq', 16, true);
