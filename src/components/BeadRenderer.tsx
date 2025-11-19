import React, { useRef, useEffect } from 'react';
import { BeadColor, BEAD_COLORS } from '../data/beadColors';

interface BeadRendererProps {
  beadData: number[][];
  width: number;
  height: number;
  beadSize: number;
  spacing: number;
  showGrid?: boolean;
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
  showGrid = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // 绘制豆子阴影
    beads.forEach(bead => {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(bead.x + 2, bead.y + 2, beadSize / 2 - 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 绘制豆子主体
    beads.forEach(bead => {
      // 创建渐变效果
      const gradient = ctx.createRadialGradient(
        bead.x - beadSize / 4,
        bead.y - beadSize / 4,
        0,
        bead.x,
        bead.y,
        beadSize / 2
      );

      // 根据颜色创建渐变
      const baseColor = bead.color.hex;
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
    });

  }, [beadData, width, height, beadSize, spacing, showGrid]);

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