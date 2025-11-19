export interface BeadColor {
  id: string;
  name: string;
  rgb: string;
  hex: string;
  category: string;
  isSpecial?: boolean; // 夜光、荧光、透明等
}

// 从您提供的数据转换
export const BEAD_COLORS: BeadColor[] = [
  // 白色系
  { id: 'P01', name: '白色', rgb: 'rgb(238,238,238)', hex: '#EEEEEE', category: '白色系' },
  { id: 'P17', name: '浅灰', rgb: 'rgb(188,188,187)', hex: '#BCBCBB', category: '白色系' },
  { id: 'P18', name: '深灰', rgb: 'rgb(138,141,145)', hex: '#8A8D91', category: '白色系' },
  { id: 'P02', name: '黑色', rgb: 'rgb(70,68,68)', hex: '#464444', category: '白色系' },
  { id: 'P84', name: '雪白', rgb: 'rgb(253,254,254)', hex: '#FDFEFE', category: '白色系' },
  { id: 'P85', name: '奶油白', rgb: 'rgb(255,246,226)', hex: '#FFF6E2', category: '白色系' },

  // 红色系
  { id: 'P06', name: '红色', rgb: 'rgb(179,25,46)', hex: '#B3192E', category: '红色系' },
  { id: 'P20', name: '浅红', rgb: 'rgb(229,77,65)', hex: '#E54D41', category: '红色系' },
  { id: 'P22', name: '深红', rgb: 'rgb(122,26,42)', hex: '#7A1A2A', category: '红色系' },
  { id: 'P53', name: '酒红', rgb: 'rgb(137,27,54)', hex: '#891B36', category: '红色系' },
  { id: 'P59', name: '朱红', rgb: 'rgb(224,66,66)', hex: '#E04242', category: '红色系' },
  { id: 'P87', name: '咖啡红', rgb: 'rgb(150,54,54)', hex: '#963636', category: '红色系' },
  { id: 'P88', name: '铁锈红', rgb: 'rgb(172,68,68)', hex: '#AC4444', category: '红色系' },

  // 粉色系
  { id: 'P08', name: '粉红', rgb: 'rgb(238,158,176)', hex: '#EE9EB0', category: '粉色系' },
  { id: 'P54', name: '淡粉', rgb: 'rgb(247,207,214)', hex: '#F7CFD6', category: '粉色系' },
  { id: 'P58', name: '亮粉', rgb: 'rgb(245,108,155)', hex: '#F56C9B', category: '粉色系' },
  { id: 'P57', name: '玫瑰粉', rgb: 'rgb(224,126,175)', hex: '#E07EAF', category: '粉色系' },
  { id: 'P86', name: '樱花粉', rgb: 'rgb(255,193,213)', hex: '#FFC1D5', category: '粉色系' },

  // 黄色系
  { id: 'P03', name: '黄色', rgb: 'rgb(252,216,86)', hex: '#FCD856', category: '黄色系' },
  { id: 'P46', name: '浅黄', rgb: 'rgb(254,238,170)', hex: '#FEEEAA', category: '黄色系' },
  { id: 'P83', name: '奶黄', rgb: 'rgb(254,232,119)', hex: '#FEE877', category: '黄色系' },
  { id: 'P15', name: '金黄', rgb: 'rgb(255,217,102)', hex: '#FFD966', category: '黄色系' },
  { id: 'P19', name: '土黄', rgb: 'rgb(229,155,86)', hex: '#E59B56', category: '黄色系' },
  { id: 'P74', name: '杏黄', rgb: 'rgb(252,220,128)', hex: '#FCDc80', category: '黄色系' },

  // 橙色系
  { id: 'P04', name: '橙色', rgb: 'rgb(240,108,34)', hex: '#F06C22', category: '橙色系' },
  { id: 'P47', name: '浅橙', rgb: 'rgb(255,185,141)', hex: '#FFB98D', category: '橙色系' },
  { id: 'P25', name: '深橙', rgb: 'rgb(202,81,47)', hex: '#CA512F', category: '橙色系' },
  { id: 'P63', name: '珊瑚橙', rgb: 'rgb(255,127,80)', hex: '#FF7F50', category: '橙色系' },

  // 绿色系
  { id: 'P10', name: '绿色', rgb: 'rgb(25,132,72)', hex: '#198448', category: '绿色系' },
  { id: 'P11', name: '浅绿', rgb: 'rgb(118,199,130)', hex: '#76C782', category: '绿色系' },
  { id: 'P61', name: '深绿', rgb: 'rgb(0,102,61)', hex: '#00663D', category: '绿色系' },
  { id: 'P42', name: '薄荷绿', rgb: 'rgb(123,218,214)', hex: '#7BDAD6', category: '绿色系' },
  { id: 'P21', name: '草绿', rgb: 'rgb(104,159,56)', hex: '#689F38', category: '绿色系' },
  { id: 'P56', name: '墨绿', rgb: 'rgb(31,99,71)', hex: '#1F6347', category: '绿色系' },
  { id: 'P75', name: '青绿', rgb: 'rgb(133,193,158)', hex: '#85C19E', category: '绿色系' },
  { id: 'P89', name: '橄榄绿', rgb: 'rgb(107,142,35)', hex: '#6B8E23', category: '绿色系' },

  // 蓝色系
  { id: 'P07', name: '蓝色', rgb: 'rgb(44,113,171)', hex: '#2C71AB', category: '蓝色系' },
  { id: 'P09', name: '浅蓝', rgb: 'rgb(108,172,207)', hex: '#6CACCF', category: '蓝色系' },
  { id: 'P43', name: '天蓝', rgb: 'rgb(134,200,239)', hex: '#86C8EF', category: '蓝色系' },
  { id: 'P51', name: '深蓝', rgb: 'rgb(38,59,114)', hex: '#263B72', category: '蓝色系' },
  { id: 'P52', name: '海军蓝', rgb: 'rgb(52,87,136)', hex: '#345788', category: '蓝色系' },
  { id: 'P26', name: '宝蓝', rgb: 'rgb(51,102,153)', hex: '#336699', category: '蓝色系' },
  { id: 'P60', name: '藏蓝', rgb: 'rgb(25,25,112)', hex: '#191970', category: '蓝色系' },
  { id: 'P76', name: '浅灰蓝', rgb: 'rgb(135,206,235)', hex: '#87CEEB', category: '蓝色系' },
  { id: 'P90', name: '靛蓝', rgb: 'rgb(75,0,130)', hex: '#4B0082', category: '蓝色系' },

  // 紫色系
  { id: 'P05', name: '紫色', rgb: 'rgb(109,72,137)', hex: '#6D4889', category: '紫色系' },
  { id: 'P44', name: '浅紫', rgb: 'rgb(182,144,202)', hex: '#B690CA', category: '紫色系' },
  { id: 'P45', name: '深紫', rgb: 'rgb(84,50,119)', hex: '#543277', category: '紫色系' },
  { id: 'P23', name: '薰衣草紫', rgb: 'rgb(199,186,220)', hex: '#C7BADc', category: '紫色系' },
  { id: 'P55', name: '葡萄紫', rgb: 'rgb(138,43,226)', hex: '#8A2BE2', category: '紫色系' },

  // 棕色系
  { id: 'P12', name: '棕色', rgb: 'rgb(113,66,47)', hex: '#71422F', category: '棕色系' },
  { id: 'P62', name: '浅棕', rgb: 'rgb(169,123,103)', hex: '#A97B67', category: '棕色系' },
  { id: 'P70', name: '深棕', rgb: 'rgb(81,51,40)', hex: '#513328', category: '棕色系' },
  { id: 'P13', name: '米色', rgb: 'rgb(222,184,135)', hex: '#DEB887', category: '棕色系' },
  { id: 'P71', name: '巧克力色', rgb: 'rgb(128,64,0)', hex: '#804000', category: '棕色系' },
  { id: 'P79', name: '咖啡色', rgb: 'rgb(111,78,55)', hex: '#6F4E37', category: '棕色系' },
  { id: 'P91', name: '卡其色', rgb: 'rgb(195,176,145)', hex: '#C3B091', category: '棕色系' },

  // 特殊色（夜光、荧光等）
  { id: 'P34', name: '夜光黄绿', rgb: 'rgb(214,229,171)', hex: '#D6E5AB', category: '特殊色', isSpecial: true },
  { id: 'P35', name: '夜光橙', rgb: 'rgb(255,196,161)', hex: '#FFC4A1', category: '特殊色', isSpecial: true },
  { id: 'P36', name: '夜光粉', rgb: 'rgb(255,182,193)', hex: '#FFB6C1', category: '特殊色', isSpecial: true },
  { id: 'P37', name: '夜光蓝', rgb: 'rgb(173,216,230)', hex: '#ADD8E6', category: '特殊色', isSpecial: true },
  { id: 'P48', name: '荧光黄', rgb: 'rgb(255,233,0)', hex: '#FFE900', category: '特殊色', isSpecial: true },
  { id: 'P49', name: '荧光橙', rgb: 'rgb(255,127,0)', hex: '#FF7F00', category: '特殊色', isSpecial: true },
  { id: 'P50', name: '荧光粉', rgb: 'rgb(255,62,150)', hex: '#FF3E96', category: '特殊色', isSpecial: true },
  { id: 'P73', name: '荧光绿', rgb: 'rgb(0,255,127)', hex: '#00FF7F', category: '特殊色', isSpecial: true },

  // 透明色系
  { id: 'P27', name: '透明红', rgb: 'rgb(255,0,0,0.5)', hex: '#FF000080', category: '透明色', isSpecial: true },
  { id: 'P28', name: '透明蓝', rgb: 'rgb(0,0,255,0.5)', hex: '#0000FF80', category: '透明色', isSpecial: true },
  { id: 'P29', name: '透明黄', rgb: 'rgb(255,255,0,0.5)', hex: '#FFFF0080', category: '透明色', isSpecial: true },
  { id: 'P30', name: '透明绿', rgb: 'rgb(0,255,0,0.5)', hex: '#00FF0080', category: '透明色', isSpecial: true },

  // 金属色系
  { id: 'P31', name: '金色', rgb: 'rgb(255,215,0)', hex: '#FFD700', category: '金属色', isSpecial: true },
  { id: 'P32', name: '银色', rgb: 'rgb(192,192,192)', hex: '#C0C0C0', category: '金属色', isSpecial: true },
  { id: 'P33', name: '青铜色', rgb: 'rgb(205,127,50)', hex: '#CD7F32', category: '金属色', isSpecial: true },

  // 珠光色系
  { id: 'P38', name: '珠光白', rgb: 'rgb(255,250,250)', hex: '#FFFAFA', category: '珠光色', isSpecial: true },
  { id: 'P39', name: '珠光粉', rgb: 'rgb(255,182,193)', hex: '#FFB6C1', category: '珠光色', isSpecial: true },
  { id: 'P40', name: '珠光蓝', rgb: 'rgb(176,224,230)', hex: '#B0E0E6', category: '珠光色', isSpecial: true },
  { id: 'P41', name: '珠光紫', rgb: 'rgb(221,160,221)', hex: '#DDA0DD', category: '珠光色', isSpecial: true }
];

// 按分类组织
export const COLOR_CATEGORIES = {
  '白色系': BEAD_COLORS.filter(c => c.category === '白色系'),
  '红色系': BEAD_COLORS.filter(c => c.category === '红色系'),
  '粉色系': BEAD_COLORS.filter(c => c.category === '粉色系'),
  '黄色系': BEAD_COLORS.filter(c => c.category === '黄色系'),
  '橙色系': BEAD_COLORS.filter(c => c.category === '橙色系'),
  '绿色系': BEAD_COLORS.filter(c => c.category === '绿色系'),
  '蓝色系': BEAD_COLORS.filter(c => c.category === '蓝色系'),
  '紫色系': BEAD_COLORS.filter(c => c.category === '紫色系'),
  '棕色系': BEAD_COLORS.filter(c => c.category === '棕色系'),
  '特殊色': BEAD_COLORS.filter(c => c.category === '特殊色'),
  '透明色': BEAD_COLORS.filter(c => c.category === '透明色'),
  '金属色': BEAD_COLORS.filter(c => c.category === '金属色'),
  '珠光色': BEAD_COLORS.filter(c => c.category === '珠光色'),
};

// RGB转数组
export function parseRGB(rgbString: string): [number, number, number] {
  // 处理带有alpha的rgba格式
  const match = rgbString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (!match) return [0, 0, 0];
  return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
}

// 颜色验证函数
export function isValidHexColor(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(hex);
}

// RGB转HEX
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// HEX转RGB
export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}