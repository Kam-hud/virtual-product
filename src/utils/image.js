// 图片地址解析：数据库与兜底数据中图片以相对路径存储，
// 统一拼接 Vite base 路径（兼容 GitHub Pages 子路径部署）
export function resolveImage(src) {
    if (!src) return ''
    if (/^(https?:)?\/\//.test(src) || src.startsWith('data:')) return src
    // 以 / 开头的视为 public 根路径（如 /uploads/xxx），需加 base
    if (src.startsWith('/')) {
        const base = import.meta.env.BASE_URL || '/'
        return base.replace(/\/$/, '') + src
    }
    const base = import.meta.env.BASE_URL || '/'
    return base + src
}

export function resolveAvatar(src) {
    return resolveImage(src)
}
