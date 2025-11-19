# 部署指南

## GitHub Pages 部署

### 方法一：使用 GitHub Actions（推荐）

1. **创建 GitHub 仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/perler-bead-generator.git
   git push -u origin main
   ```

2. **启用 GitHub Pages**
   - 进入仓库 Settings > Pages
   - Source 选择 `GitHub Actions`

3. **创建 GitHub Actions 工作流**
   创建 `.github/workflows/deploy.yml`：
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]
   workflow_dispatch:

   permissions:
     contents: read
     pages: write
     id-token: write

   concurrency:
     group: "pages"
     cancel-in-progress: false

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
       - name: Checkout
         uses: actions/checkout@v4

       - name: Setup Node
         uses: actions/setup-node@v4
         with:
           node-version: '18'

       - name: Setup Pages
         uses: actions/configure-pages@v4

       - name: Install dependencies
         run: npm ci

       - name: Build
         run: npm run build

       - name: Upload artifact
         uses: actions/upload-pages-artifact@v3
         with:
           path: './dist'

     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       runs-on: ubuntu-latest
       needs: build
       steps:
       - name: Deploy to GitHub Pages
         id: deployment
         uses: actions/deploy-pages@v4
   ```

### 方法二：手动部署

1. **安装 gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **更新 package.json**
   ```json
   {
     "scripts": {
       "deploy": "npm run build && gh-pages -d dist"
     }
   }
   ```

3. **部署**
   ```bash
   npm run deploy
   ```

## 自定义域名（可选）

在仓库根目录创建 `CNAME` 文件：
```
your-domain.com
```

## 部署后的访问地址

- GitHub Pages: `https://your-username.github.io/perler-bead-generator/`
- 自定义域名: `https://your-domain.com`

## 常见问题

### 1. 静态资源路径错误
确保 `vite.config.ts` 中的 `base` 路径正确：
```typescript
export default defineConfig({
  base: '/perler-bead-generator/', // 你的仓库名
});
```

### 2. 路由问题
本项目使用 Hash Router，不会有路由问题。

### 3. PDF 导出问题
确保用户浏览器支持 Blob 和下载功能。

### 4. 图片处理性能
大尺寸图片可能需要较长时间处理，建议：
- 限制图片最大尺寸
- 添加进度条
- 使用 Web Workers

## 生产环境优化

### 1. 启用 gzip 压缩
GitHub Pages 自动启用 gzip 压缩。

### 2. 缓存策略
静态资源会被自动缓存。

### 3. CDN
GitHub Pages 提供全球 CDN。

### 4. 监控
可以使用 Google Analytics 等工具监控使用情况。

## 维护

### 更新应用
```bash
npm run build
npm run deploy
```

### 查看部署日志
- GitHub Actions: 仓库 Actions 标签页
- 手动部署: 检查终端输出

### 回滚
如果部署出现问题，可以：
1. 回滚到之前的提交
2. 重新部署
3. 检查构建日志