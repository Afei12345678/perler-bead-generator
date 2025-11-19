/**
 * 调整图片到目标尺寸
 */
export function resizeImage(
  sourceCanvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number,
  maintainAspectRatio: boolean = true
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');

  if (maintainAspectRatio) {
    // 保持宽高比
    const sourceRatio = sourceCanvas.width / sourceCanvas.height;
    const targetRatio = targetWidth / targetHeight;

    let finalWidth = targetWidth;
    let finalHeight = targetHeight;

    if (sourceRatio > targetRatio) {
      // 原图更宽，以宽度为准
      finalHeight = Math.floor(targetWidth / sourceRatio);
    } else {
      // 原图更高，以高度为准
      finalWidth = Math.floor(targetHeight * sourceRatio);
    }

    canvas.width = finalWidth;
    canvas.height = finalHeight;
  } else {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas context not available');

  // 清除画布背景为白色
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 使用高质量缩放
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(sourceCanvas, 0, 0, canvas.width, canvas.height);

  return canvas;
}

/**
 * 智能裁剪图片（自动检测主要内容）
 */
export function smartCropImage(
  sourceCanvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas context not available');

  // 清除画布背景为白色
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 简单实现：居中裁剪
  const sourceRatio = sourceCanvas.width / sourceCanvas.height;
  const targetRatio = targetWidth / targetHeight;

  let sourceX = 0, sourceY = 0, sourceW = sourceCanvas.width, sourceH = sourceCanvas.height;

  if (sourceRatio > targetRatio) {
    // 原图更宽，裁剪左右
    sourceW = sourceCanvas.height * targetRatio;
    sourceX = (sourceCanvas.width - sourceW) / 2;
  } else {
    // 原图更高，裁剪上下
    sourceH = sourceCanvas.width / targetRatio;
    sourceY = (sourceCanvas.height - sourceH) / 2;
  }

  ctx.drawImage(
    sourceCanvas,
    sourceX, sourceY, sourceW, sourceH,
    0, 0, targetWidth, targetHeight
  );

  return canvas;
}

/**
 * 加载图片文件
 */
export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src); // 清理内存
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('图片加载失败'));
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 从URL加载图片
 */
export function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // 处理跨域
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = url;
  });
}

/**
 * 图片转Canvas
 */
export function imageToCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  ctx.drawImage(img, 0, 0);
  return canvas;
}

/**
 * 调整图片亮度、对比度、饱和度
 */
export function adjustImageProperties(
  canvas: HTMLCanvasElement,
  options: {
    brightness?: number;    // -100 到 100
    contrast?: number;     // -100 到 100
    saturation?: number;   // -100 到 100
  } = {}
): HTMLCanvasElement {
  const { brightness = 0, contrast = 0, saturation = 0 } = options;

  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = canvas.width;
  resultCanvas.height = canvas.height;

  const ctx = resultCanvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  // 先绘制原图
  ctx.drawImage(canvas, 0, 0);

  // 获取像素数据
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 计算对比度因子
  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < data.length; i += 4) {
    let [r, g, b] = [data[i], data[i + 1], data[i + 2]];

    // 应用亮度
    r += brightness;
    g += brightness;
    b += brightness;

    // 应用对比度
    r = contrastFactor * (r - 128) + 128;
    g = contrastFactor * (g - 128) + 128;
    b = contrastFactor * (b - 128) + 128;

    // 应用饱和度
    if (saturation !== 0) {
      const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
      const saturationFactor = (saturation + 100) / 100;
      r = gray + saturationFactor * (r - gray);
      g = gray + saturationFactor * (g - gray);
      b = gray + saturationFactor * (b - gray);
    }

    // 确保颜色值在有效范围内
    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  ctx.putImageData(imageData, 0, 0);
  return resultCanvas;
}

/**
 * 锐化图片
 */
export function sharpenImage(canvas: HTMLCanvasElement, strength: number = 1): HTMLCanvasElement {
  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = canvas.width;
  resultCanvas.height = canvas.height;

  const ctx = resultCanvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  ctx.drawImage(canvas, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  // 锐化卷积核
  const kernel = [
    0, -1 * strength, 0,
    -1 * strength, 1 + 4 * strength, -1 * strength,
    0, -1 * strength, 0
  ];

  const output = new Uint8ClampedArray(data);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) { // RGB channels
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixelIndex = ((y + ky) * width + (x + kx)) * 4 + c;
            const kernelIndex = (ky + 1) * 3 + (kx + 1);
            sum += data[pixelIndex] * kernel[kernelIndex];
          }
        }
        const outputIndex = (y * width + x) * 4 + c;
        output[outputIndex] = Math.max(0, Math.min(255, sum));
      }
    }
  }

  const outputImageData = new ImageData(output, width, height);
  ctx.putImageData(outputImageData, 0, 0);
  return resultCanvas;
}

/**
 * 去噪图片
 */
export function denoiseImage(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = canvas.width;
  resultCanvas.height = canvas.height;

  const ctx = resultCanvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  ctx.drawImage(canvas, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  const output = new Uint8ClampedArray(data);

  // 中值滤波
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) { // RGB channels
        const neighbors = [];
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixelIndex = ((y + ky) * width + (x + kx)) * 4 + c;
            neighbors.push(data[pixelIndex]);
          }
        }
        neighbors.sort((a, b) => a - b);
        const median = neighbors[Math.floor(neighbors.length / 2)];
        const outputIndex = (y * width + x) * 4 + c;
        output[outputIndex] = median;
      }
    }
  }

  const outputImageData = new ImageData(output, width, height);
  ctx.putImageData(outputImageData, 0, 0);
  return resultCanvas;
}

/**
 * 边缘检测（用于增强线条）
 */
export function detectEdges(canvas: HTMLCanvasElement, threshold: number = 30): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  // Sobel边缘检测
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  const output = new Uint8ClampedArray(data);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let pixelX = 0;
      let pixelY = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
          const kernelIdx = (ky + 1) * 3 + (kx + 1);
          pixelX += gray * sobelX[kernelIdx];
          pixelY += gray * sobelY[kernelIdx];
        }
      }

      const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
      const outputIdx = (y * width + x) * 4;

      if (magnitude > threshold) {
        output[outputIdx] = 0;     // R
        output[outputIdx + 1] = 0; // G
        output[outputIdx + 2] = 0; // B
      } else {
        output[outputIdx] = 255;     // R
        output[outputIdx + 1] = 255; // G
        output[outputIdx + 2] = 255; // B
      }
      output[outputIdx + 3] = data[outputIdx + 3]; // Alpha
    }
  }

  const edgeImageData = new ImageData(output, width, height);
  const edgeCanvas = document.createElement('canvas');
  edgeCanvas.width = width;
  edgeCanvas.height = height;
  const edgeCtx = edgeCanvas.getContext('2d');
  if (edgeCtx) {
    edgeCtx.putImageData(edgeImageData, 0, 0);
  }

  return edgeCanvas;
}

/**
 * 应用图片滤镜组合
 */
export function applyImageFilters(
  canvas: HTMLCanvasElement,
  options: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    sharpen?: boolean;
    denoise?: boolean;
    edgeDetection?: boolean;
    edgeThreshold?: number;
  } = {}
): HTMLCanvasElement {
  let processedCanvas = canvas;

  // 去噪
  if (options.denoise) {
    processedCanvas = denoiseImage(processedCanvas);
  }

  // 调整基本属性
  processedCanvas = adjustImageProperties(processedCanvas, {
    brightness: options.brightness,
    contrast: options.contrast,
    saturation: options.saturation
  });

  // 锐化
  if (options.sharpen) {
    processedCanvas = sharpenImage(processedCanvas);
  }

  return processedCanvas;
}