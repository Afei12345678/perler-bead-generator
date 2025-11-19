import React, { useState, useRef, useEffect, useCallback } from 'react';
import { loadImage, imageToCanvas, resizeImage, applyImageFilters } from './utils/imageProcessor';
import { convertImageToBeads, calculateColorQuality } from './utils/colorMatcher';
import { generatePDF, generatePatternOnlyPDF } from './utils/pdfGenerator';
import { BeadColor, BEAD_COLORS } from './data/beadColors';
import { BeadRenderer } from './components/BeadRenderer';

type ProcessingStatus = 'idle' | 'processing' | 'completed' | 'error';

interface ImageFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  sharpen: boolean;
  denoise: boolean;
}

function App() {
  // 状态管理
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [originalCanvas, setOriginalCanvas] = useState<HTMLCanvasElement | null>(null);
  const [beadData, setBeadData] = useState<BeadColor[][] | null>(null);
  const [beadDataNumeric, setBeadDataNumeric] = useState<number[][] | null>(null); // 存储颜色索引
  const [colorCount, setColorCount] = useState<Map<string, number>>(new Map());
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 模板设置
  const [targetWidth, setTargetWidth] = useState(29);
  const [targetHeight, setTargetHeight] = useState(29);
  const [excludeSpecial, setExcludeSpecial] = useState(false);
  const [excludeTranslucent, setExcludeTranslucent] = useState(true);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);

  // 显示选项
  const [showGrid, setShowGrid] = useState(true);
  const [showNumbers, setShowNumbers] = useState(false);
  const [cellSize, setCellSize] = useState(15);

  // 拼豆渲染选项
  const [beadSize, setBeadSize] = useState(20);
  const [beadSpacing, setBeadSpacing] = useState(3);
  const [renderStyle, setRenderStyle] = useState<'circle' | 'square'>('square'); // 默认方形
  const [showBeadNumbers, setShowBeadNumbers] = useState(false);

  // 图片滤镜
  const [filters, setFilters] = useState<ImageFilters>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    sharpen: false,
    denoise: false
  });

  // 质量信息
  const [qualityInfo, setQualityInfo] = useState<{
    averageError: number;
    maxError: number;
    minError: number;
  } | null>(null);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件上传
  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setProcessingStatus('processing');
      setErrorMessage('');

      const img = await loadImage(file);
      setSourceImage(img);

      // 转换为Canvas
      const canvas = imageToCanvas(img);
      setOriginalCanvas(canvas);

      // 自动处理图片
      await processImage(canvas);
    } catch (error) {
      console.error('图片加载失败:', error);
      setErrorMessage('图片加载失败，请重试');
      setProcessingStatus('error');
    }
  }, [targetWidth, targetHeight, excludeSpecial, excludeTranslucent, maintainAspectRatio, filters]);

  // 处理图片转换
  const processImage = useCallback(async (sourceCanvas: HTMLCanvasElement) => {
    if (!sourceCanvas) return;

    try {
      setProcessingStatus('processing');

      // 应用滤镜
      let processedCanvas = applyImageFilters(sourceCanvas, filters);

      // 调整尺寸
      const resizedCanvas = resizeImage(
        processedCanvas,
        targetWidth,
        targetHeight,
        maintainAspectRatio
      );

      // 获取像素数据
      const ctx = resizedCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Canvas context error');

      const imageData = ctx.getImageData(0, 0, resizedCanvas.width, resizedCanvas.height);

      // 转换为拼豆颜色
      const { beadData: newBeadData, colorCount: newColorCount, numericData: newNumericData } = convertImageToBeads(
        imageData,
        {
          width: targetWidth,
          height: targetHeight,
          excludeSpecial,
          excludeTranslucent
        }
      );

      setBeadData(newBeadData);
      setBeadDataNumeric(newNumericData);
      setColorCount(newColorCount);

      // 计算质量信息
      const quality = calculateColorQuality(imageData, newBeadData);
      setQualityInfo(quality);

      // 不再需要传统Canvas绘制，直接使用BeadRenderer

      setProcessingStatus('completed');
    } catch (error) {
      console.error('转换失败:', error);
      setErrorMessage('转换失败，请重试');
      setProcessingStatus('error');
    }
  }, [targetWidth, targetHeight, excludeSpecial, excludeTranslucent, maintainAspectRatio, filters]);

  // 绘制预览
  const drawPreview = useCallback((data: BeadColor[][]) => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    canvas.width = data[0].length * cellSize;
    canvas.height = data.length * cellSize;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清除画布
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    data.forEach((row, y) => {
      row.forEach((bead, x) => {
        // 绘制拼豆
        ctx.fillStyle = bead.hex;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

        // 绘制网格
        if (showGrid) {
          ctx.strokeStyle = '#e5e7eb';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }

        // 显示编号
        if (showNumbers && cellSize >= 8) {
          ctx.fillStyle = getContrastColor(bead.hex);
          ctx.font = `${Math.max(6, cellSize / 3)}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(bead.id, x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
        }
      });
    });
  }, [cellSize, showGrid, showNumbers]);

  // 获取对比色
  const getContrastColor = (hex: string): string => {
    const color = parseInt(hex.slice(1), 16);
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  // 重新处理（参数变化时）
  useEffect(() => {
    if (originalCanvas && processingStatus === 'completed') {
      processImage(originalCanvas);
    }
  }, [targetWidth, targetHeight, excludeSpecial, excludeTranslucent, maintainAspectRatio, filters]);

  // 更新预览显示
  useEffect(() => {
    if (beadData) {
      drawPreview(beadData);
    }
  }, [showGrid, showNumbers, cellSize, beadData, drawPreview]);

  // 文件选择处理
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // 拖拽处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  };

  // 预设尺寸
  const applyPresetSize = (width: number, height: number) => {
    setTargetWidth(width);
    setTargetHeight(height);
  };

  // 导出功能
  const handleExportPDF = () => {
    if (!beadData) return;

    generatePDF({
      beadData,
      colorCount,
      gridSize: 5,
      showGrid,
      showNumbers,
      title: '拼豆模板',
      author: '拼豆模板生成器',
      notes: generateSettingsDescription()
    });
  };

  const handleExportPatternOnlyPDF = () => {
    if (!beadData) return;

    generatePatternOnlyPDF(beadData, {
      gridSize: 5,
      showGrid,
      showNumbers,
      title: `拼豆图案_${targetWidth}x${targetHeight}`
    });
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;

      const link = document.createElement('a');
      link.download = `拼豆图案_${targetWidth}x${targetHeight}_${Date.now()}.png`;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    });
  };

  // 生成设置描述
  const generateSettingsDescription = () => {
    return `尺寸: ${targetWidth}×${targetHeight}, 排除特殊色: ${excludeSpecial}, 排除透明色: ${excludeTranslucent}`;
  };

  // 计算统计信息
  const totalBeads = Array.from(colorCount.values()).reduce((sum, count) => sum + count, 0);
  const uniqueColors = colorCount.size;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">拼豆模板生成器</h1>
              <p className="text-sm text-gray-600">上传图片，一键生成拼豆图案</p>
            </div>
            <div className="flex items-center space-x-4">
              {processingStatus === 'processing' && (
                <div className="flex items-center space-x-2">
                  <div className="loading-spinner"></div>
                  <span className="text-sm text-gray-600">处理中...</span>
                </div>
              )}
              {qualityInfo && (
                <div className="text-sm text-gray-600">
                  质量分数: {Math.round(100 - qualityInfo.averageError)}%
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：控制面板 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 上传区域 */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">1. 上传图片</h2>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div
                className="upload-area cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="text-gray-600">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-2">点击或拖拽图片到此处</p>
                  <p className="text-xs">支持 JPG, PNG, GIF 格式</p>
                </div>
              </div>
              {sourceImage && (
                <div className="mt-4 text-sm text-gray-600">
                  原始尺寸: {sourceImage.width} × {sourceImage.height}
                </div>
              )}
              {errorMessage && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                  {errorMessage}
                </div>
              )}
            </div>

            {/* 尺寸设置 */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">2. 模板尺寸</h2>
                <p className="card-description">设置拼豆模板的大小</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    宽度: {targetWidth} 拼豆
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={targetWidth}
                    onChange={(e) => setTargetWidth(Number(e.target.value))}
                    className="slider w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    高度: {targetHeight} 拼豆
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={targetHeight}
                    onChange={(e) => setTargetHeight(Number(e.target.value))}
                    className="slider w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="maintainAspectRatio"
                      checked={maintainAspectRatio}
                      onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="maintainAspectRatio" className="text-sm">
                      保持宽高比
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => applyPresetSize(29, 29)}
                    className="btn btn-secondary text-sm"
                  >
                    正方形 29×29
                  </button>
                  <button
                    onClick={() => applyPresetSize(29, 34)}
                    className="btn btn-secondary text-sm"
                  >
                    长方形 29×34
                  </button>
                  <button
                    onClick={() => applyPresetSize(50, 50)}
                    className="btn btn-secondary text-sm"
                  >
                    大尺寸 50×50
                  </button>
                  <button
                    onClick={() => applyPresetSize(100, 100)}
                    className="btn btn-secondary text-sm"
                  >
                    超大 100×100
                  </button>
                </div>
              </div>
            </div>

            {/* 图片滤镜 */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">3. 图片处理</h2>
                <p className="card-description">优化图片质量</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    亮度: {filters.brightness > 0 ? '+' : ''}{filters.brightness}
                  </label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={filters.brightness}
                    onChange={(e) => setFilters(prev => ({ ...prev, brightness: Number(e.target.value) }))}
                    className="slider w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    对比度: {filters.contrast > 0 ? '+' : ''}{filters.contrast}
                  </label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={filters.contrast}
                    onChange={(e) => setFilters(prev => ({ ...prev, contrast: Number(e.target.value) }))}
                    className="slider w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    饱和度: {filters.saturation > 0 ? '+' : ''}{filters.saturation}
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={filters.saturation}
                    onChange={(e) => setFilters(prev => ({ ...prev, saturation: Number(e.target.value) }))}
                    className="slider w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.sharpen}
                      onChange={(e) => setFilters(prev => ({ ...prev, sharpen: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">锐化</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.denoise}
                      onChange={(e) => setFilters(prev => ({ ...prev, denoise: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">去噪</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 颜色选项 */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">4. 颜色选项</h2>
                <p className="card-description">选择使用的拼豆颜色</p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={excludeSpecial}
                    onChange={(e) => setExcludeSpecial(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">排除特殊色（夜光、荧光）</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={excludeTranslucent}
                    onChange={(e) => setExcludeTranslucent(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">排除透明色</span>
                </label>
              </div>
            </div>

            {/* 显示选项 */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">5. 显示选项</h2>
                <p className="card-description">预览设置</p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">显示网格</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showNumbers}
                    onChange={(e) => setShowNumbers(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">显示编号</span>
                </label>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    预览大小: {cellSize}px
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={cellSize}
                    onChange={(e) => setCellSize(Number(e.target.value))}
                    className="slider w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">渲染样式</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="square"
                        checked={renderStyle === 'square'}
                        onChange={(e) => setRenderStyle(e.target.value as 'circle' | 'square')}
                        className="mr-2"
                      />
                      <span className="text-sm">方形色块</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="circle"
                        checked={renderStyle === 'circle'}
                        onChange={(e) => setRenderStyle(e.target.value as 'circle' | 'square')}
                        className="mr-2"
                      />
                      <span className="text-sm">圆形豆子</span>
                    </label>
                  </div>
                </div>

                {renderStyle === 'square' && (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showBeadNumbers}
                      onChange={(e) => setShowBeadNumbers(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">显示色块序号</span>
                  </label>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {renderStyle === 'circle' ? '豆子大小' : '色块大小'}: {beadSize}px
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="30"
                    value={beadSize}
                    onChange={(e) => setBeadSize(Number(e.target.value))}
                    className="slider w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {renderStyle === 'circle' ? '豆子间距' : '色块间距'}: {beadSpacing}px
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={beadSpacing}
                    onChange={(e) => setBeadSpacing(Number(e.target.value))}
                    className="slider w-full"
                  />
                </div>
              </div>
            </div>

            {/* 导出选项 */}
            {beadData && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">6. 导出模板</h2>
                  <p className="card-description">生成拼豆模板文件</p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleExportPDF}
                    className="btn btn-success w-full"
                  >
                    导出完整PDF（含清单）
                  </button>

                  <button
                    onClick={handleExportPatternOnlyPDF}
                    className="btn btn-primary w-full"
                  >
                    导出图案PDF
                  </button>

                  <button
                    onClick={handleExportPNG}
                    className="btn btn-secondary w-full"
                  >
                    导出PNG图片
                  </button>
                </div>

                {/* 统计信息 */}
                <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                  <div className="flex justify-between">
                    <span>总拼豆数:</span>
                    <span className="font-medium">{totalBeads}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>颜色种类:</span>
                    <span className="font-medium">{uniqueColors}</span>
                  </div>
                  {qualityInfo && (
                    <div className="flex justify-between">
                      <span>匹配质量:</span>
                      <span className="font-medium">{Math.round(100 - qualityInfo.averageError)}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 右侧：预览和颜色清单 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 预览区域 */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">预览</h2>
                {beadData && (
                  <div className="text-sm text-gray-600">
                    尺寸: {targetWidth} × {targetHeight} = {totalBeads} 个拼豆
                  </div>
                )}
              </div>

              {!beadData ? (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                  <div className="text-center text-gray-400">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2">请上传图片开始制作模板</p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="overflow-auto max-h-[600px] border rounded-lg p-4 bg-white">
                    {beadDataNumeric ? (
                      <BeadRenderer
                        beadData={beadDataNumeric}
                        width={targetWidth}
                        height={targetHeight}
                        beadSize={beadSize}
                        spacing={beadSpacing}
                        showGrid={showGrid}
                        showNumbers={showBeadNumbers}
                        renderStyle={renderStyle}
                      />
                    ) : (
                      <canvas ref={canvasRef} className="mx-auto" />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 颜色清单 */}
            {beadData && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">颜色清单</h2>
                  <div className="text-sm text-gray-600">
                    共 {uniqueColors} 种颜色
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-auto">
                  {Array.from(colorCount.entries())
                    .sort((a, b) => b[1] - a[1])
                    .map(([colorId, count]) => {
                      const color = BEAD_COLORS.find(c => c.id === colorId);
                      if (!color) return null;

                      return (
                        <div
                          key={colorId}
                          className="color-swatch p-2"
                          title={`${color.name} - ${count}个`}
                        >
                          <div
                            className="color-dot"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="flex flex-col min-w-0">
                            <div className="font-medium text-sm truncate">{color.id}</div>
                            <div className="text-xs text-gray-600 truncate">
                              {color.name}
                            </div>
                            <div className="text-xs font-medium">
                              ×{count}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* 质量信息 */}
            {qualityInfo && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">质量分析</h2>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">平均误差:</span>
                    <span className="text-sm font-medium">{qualityInfo.averageError.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">最大误差:</span>
                    <span className="text-sm font-medium">{qualityInfo.maxError.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">最小误差:</span>
                    <span className="text-sm font-medium">{qualityInfo.minError.toFixed(2)}</span>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">质量评分:</span>
                      <span className={`text-sm font-bold ${
                        qualityInfo.averageError < 10 ? 'text-green-600' :
                        qualityInfo.averageError < 20 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {Math.round(100 - qualityInfo.averageError)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          qualityInfo.averageError < 10 ? 'bg-green-500' :
                          qualityInfo.averageError < 20 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${100 - qualityInfo.averageError}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;