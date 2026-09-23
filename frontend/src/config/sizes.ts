import type { SizePreset } from '../types'

/** 允许的成品尺寸范围（同时也是预览画布的逻辑尺寸范围） */
export const MIN_SIZE = 100
export const MAX_SIZE = 4096

export const SIZE_PRESETS: SizePreset[] = [
  { id: 'portrait', name: '竖版海报', width: 800,  height: 1000 },
  { id: 'landscape', name: '横版海报', width: 1000, height: 800 },
  { id: 'square', name: '方形',     width: 1000, height: 1000 },
  { id: 'story',  name: '竖屏故事', width: 1080, height: 1920 },
  { id: 'banner', name: '宽幅横幅', width: 1920, height: 640 },
]

export interface ParsedSize {
  ok: boolean
  value: number
  error?: string
}

/** 解析并校验单个尺寸输入：缺失/非整数/越界都会给出提示 */
export function parseSize(raw: string, label: string): ParsedSize {
  const text = raw.trim()
  if (text === '') return { ok: false, value: NaN, error: `请输入${label}` }
  if (!/^\d+$/.test(text)) {
    return { ok: false, value: NaN, error: `${label}需为正整数` }
  }
  const n = Number(text)
  if (!Number.isFinite(n) || n < MIN_SIZE || n > MAX_SIZE) {
    return { ok: false, value: n, error: `${label}需在 ${MIN_SIZE}–${MAX_SIZE} 之间` }
  }
  return { ok: true, value: n }
}
