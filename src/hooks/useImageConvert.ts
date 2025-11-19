import { useState, useCallback, useRef } from 'react';
import { BeadColor } from '../data/beadColors';
import { convertImageToBeads } from '../utils/colorMatcher';
import { imageToCanvas, resizeImage, applyImageFilters } from '../utils/imageProcessor';

interface UseImageConvertOptions {
  width: number;
  height: number;
  excludeSpecial: boolean;
  excludeTranslucent: boolean;
  maintainAspectRatio: boolean;
  filters: {
    brightness: number;
    contrast: number;
    saturation: number;
    sharpen: boolean;
    denoise: boolean;
  };
}

export function useImageConvert() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const convertImage = useCallback(async (
    file: File,
    options: UseImageConvertOptions
  ): Promise<{
    beadData: BeadColor[][];
    colorCount: Map<string, number>;
    originalCanvas: HTMLCanvasElement;
    processedCanvas: HTMLCanvasElement;
  }> => {
    // 取消之前的处理
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      setIsProcessing(true);
      setError(null);
      setProgress(0);

      // 验证文件
      if (!file.type.startsWith('image/')) {
        throw new Error('请上传有效的图片文件');
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB
        throw new Error('图片文件大小不能超过10MB');
      }

      setProgress(10);

      // 检查是否被取消
      if (signal.aborted) throw new Error('处理已取消');

      // 加载图片
      const img = await loadImage(file, signal);
      setProgress(20);

      // 转换为Canvas
      const originalCanvas = imageToCanvas(img);
      setProgress(30);

      // 应用滤镜
      let processedCanvas = applyImageFilters(originalCanvas, options.filters);
      setProgress(50);

      // 调整尺寸
      const resizedCanvas = resizeImage(
        processedCanvas,
        options.width,
        options.height,
        options.maintainAspectRatio
      );
      setProgress(60);

      // 获取像素数据
      const ctx = resizedCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Canvas context error');

      const imageData = ctx.getImageData(0, 0, resizedCanvas.width, resizedCanvas.height);
      setProgress(70);

      // 转换为拼豆颜色
      const { beadData, colorCount } = convertImageToBeads(imageData, {
        width: options.width,
        height: options.height,
        excludeSpecial: options.excludeSpecial,
        excludeTranslucent: options.excludeTranslucent
      });
      setProgress(90);

      setProgress(100);

      return {
        beadData,
        colorCount,
        originalCanvas,
        processedCanvas: resizedCanvas
      };
    } catch (err) {
      if (err instanceof Error && err.message === '处理已取消') {
        // 用户取消，不显示错误
        throw err;
      }
      const errorMessage = err instanceof Error ? err.message : '图片处理失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
      setProgress(0);
      abortControllerRef.current = null;
    }
  }, []);

  const cancelProcess = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsProcessing(false);
    setProgress(0);
  }, []);

  return {
    convertImage,
    isProcessing,
    error,
    progress,
    cancelProcess
  };
}

// 内部函数，用于处理信号
async function loadImage(file: File, signal?: AbortSignal): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    const cleanup = () => {
      URL.revokeObjectURL(img.src);
    };

    img.onload = () => {
      if (signal?.aborted) {
        cleanup();
        reject(new Error('处理已取消'));
        return;
      }
      cleanup();
      resolve(img);
    };

    img.onerror = () => {
      cleanup();
      reject(new Error('图片加载失败'));
    };

    // 监听取消信号
    if (signal) {
      signal.addEventListener('abort', () => {
        cleanup();
        reject(new Error('处理已取消'));
      });
    }

    img.src = URL.createObjectURL(file);
  });
}