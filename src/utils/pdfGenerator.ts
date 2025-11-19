import jsPDF from 'jspdf';
import { BeadColor, BEAD_COLORS } from '../data/beadColors';

export interface ExportOptions {
  beadData: BeadColor[][];
  colorCount: Map<string, number>;
  gridSize: number; // 每个拼豆的显示大小(mm)
  showGrid: boolean;
  showNumbers: boolean;
  title?: string;
  author?: string;
  notes?: string;
}

export function generatePDF(options: ExportOptions): void {
  const {
    beadData,
    colorCount,
    gridSize = 5,
    showGrid = true,
    showNumbers = false,
    title = '拼豆图案模板',
    author = '',
    notes = ''
  } = options;

  const width = beadData[0].length;
  const height = beadData.length;

  // 计算图案实际尺寸
  const patternWidth = width * gridSize;
  const patternHeight = height * gridSize;

  // 页面设置
  const pageWidth = 210; // A4宽度(mm)
  const pageHeight = 297; // A4高度(mm)
  const margin = 15;

  // 根据图案尺寸决定页面方向
  const landscape = patternWidth > patternHeight;

  const pdf = new jsPDF({
    orientation: landscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // 第一页：标题和图案
  drawTitlePage(pdf, options, margin);

  // 如果图案太大，分页绘制
  if (patternWidth > pageWidth - margin * 2 || patternHeight > pageHeight - margin * 2 - 40) {
    drawLargePattern(pdf, beadData, gridSize, showGrid, showNumbers, margin, pageWidth, pageHeight);
  } else {
    drawPattern(pdf, beadData, gridSize, showGrid, showNumbers, margin);
  }

  // 第二页：颜色清单
  pdf.addPage();
  drawColorList(pdf, colorCount, margin, author, notes);

  // 第三页：购买清单
  pdf.addPage();
  drawShoppingList(pdf, colorCount, margin);

  // 保存文件
  const timestamp = new Date().toISOString().slice(0, 10);
  pdf.save(`拼豆模板_${title}_${timestamp}.pdf`);
}

function drawTitlePage(
  pdf: jsPDF,
  options: ExportOptions,
  margin: number
) {
  const { title, beadData } = options;

  // 标题
  pdf.setFontSize(20);
  pdf.setTextColor(0, 0, 0);
  pdf.text(title || '拼豆模板', margin, margin);

  // 尺寸信息
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`尺寸: ${beadData[0].length} × ${beadData.length} 拼豆`, margin, margin + 12);

  // 生成时间
  const date = new Date().toLocaleDateString('zh-CN');
  pdf.text(`生成日期: ${date}`, margin, margin + 24);

  // 说明
  pdf.setFontSize(10);
  pdf.setTextColor(150, 150, 150);
  pdf.text('本模板由拼豆模板生成器自动生成', margin, margin + 36);
}

function drawPattern(
  pdf: jsPDF,
  beadData: BeadColor[][],
  gridSize: number,
  showGrid: boolean,
  showNumbers: boolean,
  margin: number
) {
  const width = beadData[0].length;
  const height = beadData.length;

  const startY = margin + 50; // 留出标题空间

  // 绘制每个拼豆
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const bead = beadData[y][x];
      const posX = margin + x * gridSize;
      const posY = startY + y * gridSize;

      // 填充颜色
      pdf.setFillColor(bead.hex);
      pdf.rect(posX, posY, gridSize, gridSize, 'F');

      // 绘制网格
      if (showGrid) {
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.1);
        pdf.rect(posX, posY, gridSize, gridSize, 'S');
      }

      // 显示编号
      if (showNumbers && gridSize >= 4) {
        pdf.setFontSize(gridSize >= 6 ? 8 : 6);
        pdf.setTextColor(0, 0, 0);
        pdf.text(bead.id, posX + gridSize/2, posY + gridSize/2 + 1, {
          align: 'center',
          baseline: 'middle'
        });
      }
    }
  }

  // 添加边框
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.5);
  pdf.rect(margin, startY, width * gridSize, height * gridSize, 'S');
}

function drawLargePattern(
  pdf: jsPDF,
  beadData: BeadColor[][],
  gridSize: number,
  showGrid: boolean,
  showNumbers: boolean,
  margin: number,
  pageWidth: number,
  pageHeight: number
) {
  const width = beadData[0].length;
  const height = beadData.length;

  // 计算每页能显示的拼豆数量
  const colsPerPage = Math.floor((pageWidth - margin * 2) / gridSize);
  const rowsPerPage = Math.floor((pageHeight - margin * 2 - 50) / gridSize); // 减去标题空间

  const startY = margin + 50;

  // 分页绘制
  for (let pageY = 0; pageY < height; pageY += rowsPerPage) {
    for (let pageX = 0; pageX < width; pageX += colsPerPage) {
      // 如果不是第一个分块，添加新页
      if (pageY > 0 || pageX > 0) {
        pdf.addPage();
      }

      // 绘制当前分块的标题
      pdf.setFontSize(14);
      pdf.text(`图案分块 (${pageX/colsPerPage + 1}-${Math.ceil(width/colsPerPage)}, ${pageY/rowsPerPage + 1}-${Math.ceil(height/rowsPerPage)})`, margin, margin);

      // 绘制当前分块的拼豆
      for (let y = 0; y < rowsPerPage && pageY + y < height; y++) {
        for (let x = 0; x < colsPerPage && pageX + x < width; x++) {
          const bead = beadData[pageY + y][pageX + x];
          const posX = margin + x * gridSize;
          const posY = startY + y * gridSize;

          // 填充颜色
          pdf.setFillColor(bead.hex);
          pdf.rect(posX, posY, gridSize, gridSize, 'F');

          // 绘制网格
          if (showGrid) {
            pdf.setDrawColor(200, 200, 200);
            pdf.setLineWidth(0.1);
            pdf.rect(posX, posY, gridSize, gridSize, 'S');
          }

          // 显示编号
          if (showNumbers && gridSize >= 4) {
            pdf.setFontSize(gridSize >= 6 ? 6 : 4);
            pdf.setTextColor(0, 0, 0);
            pdf.text(bead.id, posX + gridSize/2, posY + gridSize/2, {
              align: 'center',
              baseline: 'middle'
            });
          }
        }
      }

      // 添加边框
      const actualCols = Math.min(colsPerPage, width - pageX);
      const actualRows = Math.min(rowsPerPage, height - pageY);

      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.rect(margin, startY, actualCols * gridSize, actualRows * gridSize, 'S');
    }
  }
}

function drawColorList(
  pdf: jsPDF,
  colorCount: Map<string, number>,
  margin: number,
  author: string,
  notes: string
) {
  // 标题
  pdf.setFontSize(16);
  pdf.text('颜色清单', margin, margin);

  let yPos = margin + 20;
  const lineHeight = 8;

  // 表头
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text('编号', margin, yPos);
  pdf.text('颜色名称', margin + 15, yPos);
  pdf.text('数量', margin + 60, yPos);
  pdf.text('颜色', margin + 80, yPos);
  pdf.text('类别', margin + 95, yPos);

  yPos += lineHeight + 2;

  // 按数量排序
  const sortedColors = Array.from(colorCount.entries())
    .sort((a, b) => b[1] - a[1]);

  // 按类别分组
  const groupedColors = new Map<string, Array<{id: string, count: number, color: BeadColor}>>();

  sortedColors.forEach(([colorId, count]) => {
    const color = BEAD_COLORS.find(c => c.id === colorId);
    if (!color) return;

    if (!groupedColors.has(color.category)) {
      groupedColors.set(color.category, []);
    }

    groupedColors.get(color.category)!.push({
      id: colorId,
      count,
      color
    });
  });

  // 绘制分组的颜色列表
  Array.from(groupedColors.entries()).forEach(([category, colors]) => {
    // 类别标题
    pdf.setFontSize(11);
    pdf.setTextColor(50, 50, 50);
    pdf.text(category, margin, yPos);
    yPos += lineHeight;

    // 该类别的颜色
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);

    colors.forEach(({ id, count, color }) => {
      pdf.text(id, margin, yPos);
      pdf.text(color.name, margin + 15, yPos);
      pdf.text(count.toString(), margin + 60, yPos);

      // 绘制颜色方块
      pdf.setFillColor(color.hex);
      pdf.rect(margin + 80, yPos - 3, 10, 5, 'F');

      // 边框
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.1);
      pdf.rect(margin + 80, yPos - 3, 10, 5, 'S');

      yPos += lineHeight - 1;

      // 检查是否需要换页
      if (yPos > 280) {
        pdf.addPage();
        yPos = margin;
      }
    });

    yPos += lineHeight / 2; // 类别间距
  });

  // 总计信息
  const totalBeads = Array.from(colorCount.values()).reduce((sum, count) => sum + count, 0);
  const uniqueColors = colorCount.size;

  yPos = Math.max(yPos + 10, 250); // 确保在页面底部

  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`总计: ${totalBeads} 个拼豆, ${uniqueColors} 种颜色`, margin, yPos);

  // 作者和备注
  if (author) {
    pdf.text(`制作者: ${author}`, margin, yPos + 8);
  }

  if (notes) {
    pdf.text(`备注: ${notes}`, margin, yPos + 16);
  }
}

function drawShoppingList(
  pdf: jsPDF,
  colorCount: Map<string, number>,
  margin: number
) {
  // 标题
  pdf.setFontSize(16);
  pdf.text('购买清单', margin, margin);

  // 说明
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text('建议购买数量（已考虑10%的备用）:', margin, margin + 12);

  let yPos = margin + 30;
  const lineHeight = 10;

  // 购买建议（按包装规格计算）
  const packagingSizes = [200, 500, 1000, 2000]; // 常见包装数量

  const sortedColors = Array.from(colorCount.entries())
    .sort((a, b) => b[1] - a[1]);

  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);

  // 表头
  pdf.text('编号', margin, yPos);
  pdf.text('颜色名称', margin + 20, yPos);
  pdf.text('需要数量', margin + 70, yPos);
  pdf.text('建议购买', margin + 110, yPos);
  pdf.text('颜色', margin + 160, yPos);

  yPos += lineHeight;

  sortedColors.forEach(([colorId, count]) => {
    const color = BEAD_COLORS.find(c => c.id === colorId);
    if (!color) return;

    // 计算建议购买数量（向上取整到最近的包装规格）
    const suggestedPurchase = Math.ceil(count * 1.1 / 100) * 100; // 增加备用并向上取整到100的倍数
    const packaging = packagingSizes.find(size => size >= suggestedPurchase) || packagingSizes[packagingSizes.length - 1];

    pdf.text(colorId, margin, yPos);
    pdf.text(color.name, margin + 20, yPos);
    pdf.text(count.toString(), margin + 70, yPos);
    pdf.text(`${suggestedPurchase} (${packaging}装)`, margin + 110, yPos);

    // 绘制颜色方块
    pdf.setFillColor(color.hex);
    pdf.rect(margin + 160, yPos - 3, 12, 6, 'F');

    // 边框
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.1);
    pdf.rect(margin + 160, yPos - 3, 12, 6, 'S');

    yPos += lineHeight;

    // 检查是否需要换页
    if (yPos > 280) {
      pdf.addPage();
      yPos = margin;
    }
  });

  // 总购买信息
  const totalNeeded = Array.from(colorCount.values()).reduce((sum, count) => sum + count, 0);
  const totalSuggested = Array.from(colorCount.entries())
    .reduce((sum, [_, count]) => sum + Math.ceil(count * 1.1 / 100) * 100, 0);

  yPos = Math.max(yPos + 10, 250);

  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`总计需要: ${totalNeeded} 个拼豆`, margin, yPos);
  pdf.text(`建议购买: ${totalSuggested} 个拼豆`, margin, yPos + 8);

  // 估计成本（按平均每个拼豆0.05元计算）
  const estimatedCost = totalSuggested * 0.05;
  pdf.text(`估计成本: ¥${estimatedCost.toFixed(2)}`, margin, yPos + 16);
}

export function generatePatternOnlyPDF(
  beadData: BeadColor[][],
  options: {
    gridSize?: number;
    showGrid?: boolean;
    showNumbers?: boolean;
    title?: string;
  } = {}
): void {
  const { gridSize = 5, showGrid = true, showNumbers = false, title = '拼豆图案' } = options;

  const width = beadData[0].length;
  const height = beadData.length;

  const pdf = new jsPDF({
    orientation: width > height ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const margin = 15;

  // 标题
  pdf.setFontSize(16);
  pdf.text(title, margin, margin);

  pdf.setFontSize(10);
  pdf.text(`尺寸: ${width} × ${height}`, margin, margin + 10);

  // 绘制图案
  drawPattern(pdf, beadData, gridSize, showGrid, showNumbers, margin + 25);

  pdf.save(`拼豆图案_${title}.pdf`);
}