import React, { useRef, useEffect } from 'react';
import { BeadColor, BEAD_COLORS } from '../data/beadColors';

interface BeadRendererProps {
  beadData: number[][];
  width: number;
  height: number;
  beadSize: number;
  spacing: number;
  showGrid?: boolean;
  showNumbers?: boolean;
  renderStyle?: 'circle' | 'square'; // 新增渲染样式选择
}

interface BeadPosition {
  x: number;
  y: number;
  color: BeadColor;
}

export const BeadRenderer: React.FC<BeadRendererProps> = ({
  beadData,
  width,
  height,
  beadSize,
  spacing,
  showGrid = true,
  showNumbers = false,
  renderStyle = 'circle'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 获取对比色
  const getContrastColor = (hex: string): string => {
    const color = parseInt(hex.slice(1), 16);
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    const canvasWidth = width * (beadSize + spacing) + spacing;
    const canvasHeight = height * (beadSize + spacing) + spacing;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // 清空画布
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 绘制网格背景
    if (showGrid) {
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;

      for (let i = 0; i <= width; i++) {
        const x = i * (beadSize + spacing) + spacing;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
      }

      for (let j = 0; j <= height; j++) {
        const y = j * (beadSize + spacing) + spacing;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
      }
    }

    // 收集所有豆子位置
    const beads: BeadPosition[] = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const colorIndex = beadData[y]?.[x];
        if (colorIndex >= 0 && colorIndex < BEAD_COLORS.length) { // 确保颜色索引有效
          const color = BEAD_COLORS[colorIndex];
          if (color) {
            beads.push({
              x: x * (beadSize + spacing) + spacing + beadSize / 2,
              y: y * (beadSize + spacing) + spacing + beadSize / 2,
              color: color
            });
          }
        }
      }
    }

    // 绘制色块
    beads.forEach((bead) => {
      const baseColor = bead.color.hex;

      if (renderStyle === 'square') {
        // 方形色块渲染
        const x = bead.x - beadSize / 2;
        const y = bead.y - beadSize / 2;

        // 创建轻微的渐变效果
        const gradient = ctx.createLinearGradient(x, y, x + beadSize, y + beadSize);
        gradient.addColorStop(0, lightenColor(baseColor, 10));
        gradient.addColorStop(1, darkenColor(baseColor, 10));

        // 绘制方形色块
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, beadSize, beadSize);

        // 绘制边框
        ctx.strokeStyle = darkenColor(baseColor, 25);
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, beadSize, beadSize);

        // 添加轻微高光
        ctx.save();
        ctx.globalAlpha = 0.3;
        const highlightGradient = ctx.createLinearGradient(x, y, x, y + beadSize / 3);
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = highlightGradient;
        ctx.fillRect(x + 1, y + 1, beadSize - 2, beadSize / 3);
        ctx.restore();

      } else {
        // 圆形豆子渲染（原有逻辑）
        // 绘制阴影
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(bead.x + 2, bead.y + 2, beadSize / 2 - 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 创建渐变效果
        const gradient = ctx.createRadialGradient(
          bead.x - beadSize / 4,
          bead.y - beadSize / 4,
          0,
          bead.x,
          bead.y,
          beadSize / 2
        );
        gradient.addColorStop(0, lightenColor(baseColor, 30));
        gradient.addColorStop(0.7, baseColor);
        gradient.addColorStop(1, darkenColor(baseColor, 20));

        // 绘制圆形豆子
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(bead.x, bead.y, beadSize / 2 - 1, 0, Math.PI * 2);
        ctx.fill();

        // 绘制豆子边框
        ctx.strokeStyle = darkenColor(baseColor, 30);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(bead.x, bead.y, beadSize / 2 - 1, 0, Math.PI * 2);
        ctx.stroke();

        // 绘制高光效果
        ctx.save();
        ctx.globalAlpha = 0.6;
        const highlightGradient = ctx.createRadialGradient(
          bead.x - beadSize / 4,
          bead.y - beadSize / 4,
          0,
          bead.x - beadSize / 4,
          bead.y - beadSize / 4,
          beadSize / 3
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = highlightGradient;
        ctx.beginPath();
        ctx.arc(bead.x - beadSize / 4, bead.y - beadSize / 4, beadSize / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    // 绘制序号（如果启用）
    if (showNumbers && renderStyle === 'square') {
      beads.forEach(bead => {

        // 设置文字样式，支持中文
        const fontSize = Math.max(8, Math.min(12, beadSize / 3));
        ctx.font = `${fontSize}px "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 添加文字背景以提高可读性
        const text = bead.color.id;
        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width;
        const textHeight = fontSize;

        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = 'white';
        ctx.fillRect(
          bead.x - textWidth / 2 - 2,
          bead.y - textHeight / 2 - 1,
          textWidth + 4,
          textHeight + 2
        );
        ctx.restore();

        // 绘制序号文字
        ctx.fillStyle = getContrastColor(bead.color.hex);
        ctx.fillText(text, bead.x, bead.y);
      });
    }

  }, [beadData, width, height, beadSize, spacing, showGrid, showNumbers, renderStyle]);

  return (
    <canvas
      ref={canvasRef}
      className="border border-gray-300 rounded-lg shadow-sm"
      style={{
        imageRendering: 'crisp-edges',
        maxWidth: '100%',
        height: 'auto'
      }}
    />
  );
};

// 辅助函数：颜色变亮
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16).slice(1);
}

// 辅助函数：颜色变暗
function darkenColor(hex: string, percent: number): string {
  return lightenColor(hex, -percent);
}