import { BEAD_COLORS, parseRGB, BeadColor } from '../data/beadColors';

// RGB转XYZ
function rgbToXyz(r: number, g: number, b: number): [number, number, number] {
  // 1. Normalize RGB to 0-1
  let rNorm = r / 255;
  let gNorm = g / 255;
  let bNorm = b / 255;

  // 2. Apply gamma correction
  rNorm = rNorm > 0.04045 ? Math.pow((rNorm + 0.055) / 1.055, 2.4) : rNorm / 12.92;
  gNorm = gNorm > 0.04045 ? Math.pow((gNorm + 0.055) / 1.055, 2.4) : gNorm / 12.92;
  bNorm = bNorm > 0.04045 ? Math.pow((bNorm + 0.055) / 1.055, 2.4) : bNorm / 12.92;

  // 3. Convert to XYZ using sRGB color space transformation matrix
  const x = (rNorm * 0.4124564 + gNorm * 0.3575761 + bNorm * 0.1804375) * 100;
  const y = (rNorm * 0.2126729 + gNorm * 0.7151522 + bNorm * 0.0721750) * 100;
  const z = (rNorm * 0.0193339 + gNorm * 0.1191920 + bNorm * 0.9503041) * 100;

  return [x, y, z];
}

// XYZ转LAB (D65 illuminant)
function xyzToLab(x: number, y: number, z: number): [number, number, number] {
  // D65 reference white point
  const xn = 95.047, yn = 100.000, zn = 108.883;

  let xRatio = x / xn;
  let yRatio = y / yn;
  let zRatio = z / zn;

  // Apply the LAB transformation
  xRatio = xRatio > 0.008856 ? Math.pow(xRatio, 1/3) : (7.787 * xRatio + 16/116);
  yRatio = yRatio > 0.008856 ? Math.pow(yRatio, 1/3) : (7.787 * yRatio + 16/116);
  zRatio = zRatio > 0.008856 ? Math.pow(zRatio, 1/3) : (7.787 * zRatio + 16/116);

  const L = (116 * yRatio) - 16;
  const A = 500 * (xRatio - yRatio);
  const B = 200 * (yRatio - zRatio);

  return [L, A, B];
}

// RGB转LAB
function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const [x, y, z] = rgbToXyz(r, g, b);
  return xyzToLab(x, y, z);
}

// 计算色度
function chromaticity(a: number, b: number): number {
  return Math.sqrt(a * a + b * b);
}

// 计算色调角（度）
function hueAngle(a: number, b: number): number {
  const angle = Math.atan2(b, a) * (180 / Math.PI);
  return angle < 0 ? angle + 360 : angle;
}

// Delta E 2000 算法（最精确的颜色差异计算）
function deltaE2000(lab1: [number, number, number], lab2: [number, number, number]): number {
  const [L1, a1, b1] = lab1;
  const [L2, a2, b2] = lab2;

  // Calculate mean values
  const LMean = (L1 + L2) / 2;

  // Calculate chromaticity
  const C1 = chromaticity(a1, b1);
  const C2 = chromaticity(a2, b2);
  const CMean = (C1 + C2) / 2;

  // Calculate G factor
  const G = 0.5 * (1 - Math.sqrt(Math.pow(CMean, 7) / (Math.pow(CMean, 7) + Math.pow(25, 7))));

  // Adjust a values
  const ap1 = (1 + G) * a1;
  const ap2 = (1 + G) * a2;

  // Calculate new chromaticity
  const Cp1 = chromaticity(ap1, b1);
  const Cp2 = chromaticity(ap2, b2);

  // Calculate mean chromaticity
  const CpMean = (Cp1 + Cp2) / 2;

  // Calculate hue angles
  let hp1 = hueAngle(ap1, b1);
  let hp2 = hueAngle(ap2, b2);

  // Handle case where both chromaticity values are zero
  if (Cp1 === 0 && Cp2 === 0) {
    hp1 = hp2 = 0;
  }

  // Calculate delta hue
  let deltaHp = hp2 - hp1;
  if (Math.abs(deltaHp) > 180) {
    if (hp2 > hp1) {
      deltaHp -= 360;
    } else {
      deltaHp += 360;
    }
  }

  // Calculate mean hue
  let hpMean = (hp1 + hp2) / 2;
  if (Math.abs(hp1 - hp2) > 180) {
    if (hp1 + hp2 < 360) {
      hpMean += 180;
    } else {
      hpMean -= 180;
    }
  }

  // Calculate T factor
  const T = 1 - 0.17 * Math.cos(((hpMean - 30) * Math.PI) / 180) +
            0.24 * Math.cos((2 * hpMean * Math.PI) / 180) +
            0.32 * Math.cos((((3 * hpMean + 6) * Math.PI) / 180)) -
            0.20 * Math.cos((((4 * hpMean - 63) * Math.PI) / 180));

  // Calculate delta values
  const deltaL = L2 - L1;
  const deltaC = Cp2 - Cp1;
  const deltaH = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin((deltaHp * Math.PI) / 360);

  // Calculate weighting factors
  const SL = 1 + (0.015 * Math.pow(LMean - 50, 2)) / Math.sqrt(20 + Math.pow(LMean - 50, 2));
  const SC = 1 + 0.045 * CpMean;
  const SH = 1 + 0.015 * CpMean * T;

  // Calculate rotation factor
  const deltaTheta = 30 * Math.exp(-Math.pow(((hpMean - 275) / 25), 2));
  const RC = 2 * Math.sqrt(Math.pow(CpMean, 7) / (Math.pow(CpMean, 7) + Math.pow(25, 7)));
  const RT = -Math.sin((2 * deltaTheta * Math.PI) / 180) * RC;

  // Calculate Delta E
  const deltaE = Math.sqrt(
    Math.pow(deltaL / SL, 2) +
    Math.pow(deltaC / SC, 2) +
    Math.pow(deltaH / SH, 2) +
    RT * (deltaC / SC) * (deltaH / SH)
  );

  return deltaE;
}

// 简化的Delta E 76算法（用于快速比较）
function deltaE76(lab1: [number, number, number], lab2: [number, number, number]): number {
  const [L1, a1, b1] = lab1;
  const [L2, a2, b2] = lab2;

  return Math.sqrt(
    Math.pow(L2 - L1, 2) +
    Math.pow(a2 - a1, 2) +
    Math.pow(b2 - b1, 2)
  );
}

// 预计算所有拼豆颜色的LAB值（优化性能）
const BEAD_COLORS_LAB = BEAD_COLORS.map(color => {
  const [r, g, b] = parseRGB(color.rgb);
  return {
    ...color,
    lab: rgbToLab(r, g, b)
  };
});

/**
 * 找到最接近的拼豆颜色
 */
export function findClosestBeadColor(
  r: number,
  g: number,
  b: number,
  excludeSpecial: boolean = false,
  excludeTranslucent: boolean = false
): BeadColor {
  const targetLab = rgbToLab(r, g, b);

  let availableColors = BEAD_COLORS_LAB;

  // 过滤特殊色
  if (excludeSpecial) {
    availableColors = availableColors.filter(c => !c.isSpecial);
  }

  // 过滤透明色
  if (excludeTranslucent) {
    availableColors = availableColors.filter(c => !c.category.includes('透明'));
  }

  let minDelta = Infinity;
  let closestColor = availableColors[0];

  for (const beadColor of availableColors) {
    // 对于大多数情况，使用快速的Delta E 76算法
    const delta = deltaE76(targetLab, beadColor.lab);

    // 如果差异很小，使用更精确的Delta E 2000算法
    const finalDelta = delta < 5 ? deltaE2000(targetLab, beadColor.lab) : delta;

    if (finalDelta < minDelta) {
      minDelta = finalDelta;
      closestColor = beadColor;
    }
  }

  return closestColor;
}

/**
 * 找到多个最接近的颜色（用于创建颜色列表）
 */
export function findClosestBeadColors(
  r: number,
  g: number,
  b: number,
  count: number = 5,
  excludeSpecial: boolean = false
): { color: BeadColor; distance: number }[] {
  const targetLab = rgbToLab(r, g, b);

  let availableColors = BEAD_COLORS_LAB;

  if (excludeSpecial) {
    availableColors = availableColors.filter(c => !c.isSpecial);
  }

  const colorDistances = availableColors.map(beadColor => {
    const distance = deltaE2000(targetLab, beadColor.lab);
    return { color: beadColor, distance };
  });

  // 按距离排序并返回前count个
  return colorDistances
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count);
}

/**
 * 批量转换图像数据
 */
export function convertImageToBeads(
  imageData: ImageData,
  options: {
    width: number;
    height: number;
    excludeSpecial?: boolean;
    excludeTranslucent?: boolean;
  }
): {
  beadData: BeadColor[][];
  colorCount: Map<string, number>;
  totalDistance: number;
} {
  const { width, height, excludeSpecial = false, excludeTranslucent = false } = options;
  const beadData: BeadColor[][] = [];
  const colorCount = new Map<string, number>();
  let totalDistance = 0;

  for (let y = 0; y < height; y++) {
    const row: BeadColor[] = [];
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = imageData.data[idx];
      const g = imageData.data[idx + 1];
      const b = imageData.data[idx + 2];
      const a = imageData.data[idx + 3];

      // 处理透明度（转换为白色背景）
      const bgR = 255, bgG = 255, bgB = 255;
      const alpha = a / 255;
      const finalR = Math.round(r * alpha + bgR * (1 - alpha));
      const finalG = Math.round(g * alpha + bgG * (1 - alpha));
      const finalB = Math.round(b * alpha + bgB * (1 - alpha));

      const beadColor = findClosestBeadColor(finalR, finalG, finalB, excludeSpecial, excludeTranslucent);

      // 计算颜色匹配的质量分数
      const [targetR, targetG, targetB] = parseRGB(beadColor.rgb);
      const targetLab = rgbToLab(finalR, finalG, finalB);
      const beadLab = rgbToLab(targetR, targetG, targetB);
      const distance = deltaE2000(targetLab, beadLab);
      totalDistance += distance;

      row.push(beadColor);

      // 统计颜色数量
      const count = colorCount.get(beadColor.id) || 0;
      colorCount.set(beadColor.id, count + 1);
    }
    beadData.push(row);
  }

  return {
    beadData,
    colorCount,
    totalDistance: totalDistance / (width * height) // 平均匹配距离
  };
}

/**
 * 优化颜色匹配（通过调整图像）
 */
export function optimizeImageColors(
  imageData: ImageData,
  iterations: number = 1
): ImageData {
  const optimizedData = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );

  for (let iter = 0; iter < iterations; iter++) {
    for (let y = 0; y < imageData.height; y++) {
      for (let x = 0; x < imageData.width; x++) {
        const idx = (y * imageData.width + x) * 4;

        const r = optimizedData.data[idx];
        const g = optimizedData.data[idx + 1];
        const b = optimizedData.data[idx + 2];

        const closestColor = findClosestBeadColor(r, g, b);
        const [targetR, targetG, targetB] = parseRGB(closestColor.rgb);

        // 应用颜色校正
        optimizedData.data[idx] = targetR;
        optimizedData.data[idx + 1] = targetG;
        optimizedData.data[idx + 2] = targetB;
      }
    }
  }

  return optimizedData;
}

/**
 * 计算颜色匹配质量
 */
export function calculateColorQuality(
  originalImage: ImageData,
  beadData: BeadColor[][]
): {
  averageError: number;
  maxError: number;
  minError: number;
  matchedPixels: number;
} {
  let totalError = 0;
  let maxError = 0;
  let minError = Infinity;
  let matchedPixels = 0;

  for (let y = 0; y < originalImage.height; y++) {
    for (let x = 0; x < originalImage.width; x++) {
      const idx = (y * originalImage.width + x) * 4;

      const r = originalImage.data[idx];
      const g = originalImage.data[idx + 1];
      const b = originalImage.data[idx + 2];

      if (y < beadData.length && x < beadData[0].length) {
        const beadColor = beadData[y][x];
        const [targetR, targetG, targetB] = parseRGB(beadColor.rgb);

        const originalLab = rgbToLab(r, g, b);
        const beadLab = rgbToLab(targetR, targetG, targetB);
        const error = deltaE2000(originalLab, beadLab);

        totalError += error;
        maxError = Math.max(maxError, error);
        minError = Math.min(minError, error);
        matchedPixels++;
      }
    }
  }

  return {
    averageError: totalError / matchedPixels,
    maxError,
    minError,
    matchedPixels
  };
}