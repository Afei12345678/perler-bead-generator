# 拼豆模板生成器

一个基于React和TypeScript的拼豆（Perler Beads）模板生成工具，可以将任意图片转换为拼豆图案，支持高质量的颜色匹配和多种导出格式。

## ✨ 主要功能

- 🖼️ **图片上传**: 支持拖拽上传，自动处理各种图片格式
- 🎨 **智能颜色匹配**: 使用Delta E 2000算法，精确匹配90+种拼豆颜色
- ⚙️ **灵活调整**: 支持自定义尺寸、亮度、对比度、饱和度等参数
- 📊 **质量分析**: 实时显示颜色匹配质量评分
- 📋 **颜色清单**: 自动生成详细的颜色数量统计
- 📄 **多格式导出**: 支持PDF（含颜色清单、购买清单）和PNG格式
- 🎯 **预设模板**: 提供常用的拼豆尺寸模板
- 🌈 **颜色过滤**: 可排除特殊色、透明色等不适合的颜色

## 🚀 快速开始

### 在线使用

访问 [GitHub Pages](https://your-username.github.io/perler-bead-generator/) 即可在线使用。

### 本地开发

1. **克隆项目**
```bash
git clone https://github.com/your-username/perler-bead-generator.git
cd perler-bead-generator
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm run dev
```

4. **构建生产版本**
```bash
npm run build
```

## 🎮 使用方法

### 1. 上传图片
- 点击上传区域选择图片
- 或直接拖拽图片到上传区域
- 支持JPG、PNG、GIF等常见格式

### 2. 调整设置
- **模板尺寸**: 设置拼豆的数量（5-100）
- **图片处理**: 调整亮度、对比度、饱和度
- **颜色选项**: 选择是否使用特殊色、透明色

### 3. 预览和导出
- 实时预览拼豆效果
- 查看颜色清单和质量评分
- 导出PDF模板或PNG图片

## 📁 项目结构

```
perler-bead-generator/
├── public/                 # 静态资源
├── src/
│   ├── data/
│   │   └── beadColors.ts  # 拼豆色卡数据
│   ├── utils/
│   │   ├── colorMatcher.ts # 颜色匹配算法
│   │   ├── imageProcessor.ts # 图片处理
│   │   └── pdfGenerator.ts  # PDF生成
│   ├── hooks/
│   │   └── useImageConvert.ts # 图片转换Hook
│   ├── components/          # React组件
│   ├── App.tsx             # 主应用组件
│   ├── main.tsx            # 应用入口
│   └── index.css           # 样式文件
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 🎨 支持的颜色

本项目支持90+种拼豆颜色，按色系分类：

- **基础色系**: 白色、红色、粉色、黄色、橙色、绿色、蓝色、紫色、棕色
- **特殊色**: 夜光色、荧光色、透明色、金属色、珠光色

### 颜色匹配算法

使用 **Delta E 2000** 算法进行颜色匹配，这是目前最准确的颜色差异计算方法：

- 考虑人眼对颜色的感知特性
- 优化亮度、色度、色调的权重
- 提供精确的颜色匹配质量评分

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI框架**: Tailwind CSS
- **图像处理**: Canvas API
- **PDF生成**: jsPDF
- **颜色算法**: Delta E 2000
- **部署**: GitHub Pages

## 📊 功能特色

### 高质量颜色匹配
```typescript
// 使用Delta E 2000算法精确匹配颜色
function findClosestBeadColor(r: number, g: number, b: number): BeadColor {
  const targetLab = rgbToLab(r, g, b);
  // 遍历所有拼豆颜色，计算最小Delta E值
  // 返回最接近的颜色
}
```

### 智能图片处理
- 自动亮度和对比度优化
- 支持锐化和去噪
- 保持宽高比的智能缩放

### 详细导出功能
- **完整PDF**: 包含图案、颜色清单、购买清单
- **图案PDF**: 仅包含拼豆图案
- **PNG图片**: 高清图片格式

## 🎯 使用场景

- **DIY手工制作**: 为拼豆爱好者提供精确的模板
- **教育用途**: 帮助学生学习颜色理论和图像处理
- **创意设计**: 将图片转换为像素艺术风格
- **商业应用**: 为拼豆相关业务提供批量模板生成

## 🔧 配置选项

### 模板尺寸预设
- 正方形: 29×29, 50×50, 100×100
- 长方形: 29×34
- 自定义: 5-100拼豆范围

### 图片滤镜
- 亮度调整: -50 到 +50
- 对比度调整: -50 到 +50
- 饱和度调整: -100 到 +100
- 锐化效果
- 去噪功能

### 颜色过滤
- 排除特殊色（夜光、荧光）
- 排除透明色
- 按色系分组显示

## 📈 性能优化

- **Web Workers**: 图片处理使用Web Workers避免UI阻塞
- **Canvas优化**: 使用`willReadFrequently: true`优化像素操作
- **缓存策略**: 预计算颜色LAB值，提高匹配速度
- **渐进式加载**: 大尺寸图片支持分块处理

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

### 开发流程
1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

### 代码规范
- 使用TypeScript进行类型检查
- 遵循ESLint和Prettier规范
- 添加必要的注释和文档
- 确保所有测试通过

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [React](https://reactjs.org/) - UI框架
- [Vite](https://vitejs.dev/) - 构建工具
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [jsPDF](https://github.com/parallax/jsPDF) - PDF生成库
- [Delta E](https://en.wikipedia.org/wiki/Color_difference) - 颜色差异算法

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 [GitHub Issue](https://github.com/your-username/perler-bead-generator/issues)
- 发送邮件到: your-email@example.com

---

⭐ 如果这个项目对你有帮助，请给它一个星标！