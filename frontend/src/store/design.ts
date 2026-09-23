import { create } from 'zustand'
import type { DesignParams, PatternType } from '../types'
import { THEMES } from '../themes/palettes'

export interface SizePreset {
  id: string
  name: string
  width: number
  height: number
}

export const SIZE_PRESETS: SizePreset[] = [
  { id: 'portrait',  name: '竖版海报', width: 800,  height: 1000 },
  { id: 'square',    name: '方形',     width: 1000, height: 1000 },
  { id: 'landscape', name: '横版',     width: 1200, height: 800 },
  { id: 'story',     name: '手机竖屏', width: 1080, height: 1920 },
]

export const MIN_SIZE = 200
export const MAX_SIZE = 4000

/** 校验自定义尺寸输入；返回错误文案，合法时返回 null */
export function validateSize(rawW: string, rawH: string): string | null {
  const wTrim = rawW.trim()
  const hTrim = rawH.trim()
  if (wTrim === '' || hTrim === '') return '尺寸不能为空，请填写宽度和高度'
  const w = Number(wTrim)
  const h = Number(hTrim)
  if (!Number.isFinite(w) || !Number.isFinite(h)) return '尺寸必须是数字'
  if (!Number.isInteger(w) || !Number.isInteger(h)) return '尺寸必须是整数'
  if (w < MIN_SIZE || w > MAX_SIZE) return `宽度需在 ${MIN_SIZE}–${MAX_SIZE}px 之间`
  if (h < MIN_SIZE || h > MAX_SIZE) return `高度需在 ${MIN_SIZE}–${MAX_SIZE}px 之间`
  return null
}

/** 当前 store 中的尺寸是否可用于出图（防止非法值悄悄导出固定尺寸） */
export function isValidStoredSize(width: number, height: number): boolean {
  return Number.isInteger(width) && Number.isInteger(height) &&
    width >= MIN_SIZE && width <= MAX_SIZE &&
    height >= MIN_SIZE && height <= MAX_SIZE
}

interface DesignStore extends DesignParams {
  svgContent: string
  sizePreset: string
  sizeError: string | null
  setParam: <K extends keyof DesignParams>(key: K, value: DesignParams[K]) => void
  setPattern: (p: PatternType) => void
  setTheme: (id: string) => void
  randomSeed: () => void
  setSvgContent: (s: string) => void
  setSizePreset: (id: string) => void
  setCustomSize: (rawW: string, rawH: string) => void
  exportSvg: () => void
  exportPng: () => void
}

const DEFAULT_SIZE = SIZE_PRESETS[0]

export const useDesignStore = create<DesignStore>((set, get) => ({
  pattern: 'spiral',
  seed: 42,
  iterations: 200,
  scale: 1.0,
  rotation: 0,
  strokeWidth: 1.5,
  opacity: 0.8,
  bgColor: '#030712',
  palette: THEMES[0].colors,
  width: DEFAULT_SIZE.width,
  height: DEFAULT_SIZE.height,
  sizePreset: DEFAULT_SIZE.id,
  sizeError: null,
  svgContent: '',
  setParam: (key, value) => set({ [key]: value } as any),
  setPattern: (p) => set({ pattern: p }),
  setTheme: (id) => {
    const theme = THEMES.find(t => t.id === id)
    if (theme) set({ palette: theme.colors })
  },
  randomSeed: () => set({ seed: Math.floor(Math.random() * 99999) }),
  setSvgContent: (s) => set({ svgContent: s }),
  setSizePreset: (id) => {
    const preset = SIZE_PRESETS.find(p => p.id === id)
    // 未知档位：提示而不是静默回退到固定尺寸
    if (!preset) {
      set({ sizeError: `未知尺寸档位：${id}` })
      return
    }
    set({ sizePreset: id, width: preset.width, height: preset.height, sizeError: null })
  },
  setCustomSize: (rawW, rawH) => {
    const error = validateSize(rawW, rawH)
    if (error) {
      // 保留上一次合法尺寸，仅记录错误，预览/导出都不会使用非法值
      set({ sizeError: error })
      return
    }
    set({
      sizePreset: 'custom',
      width: Number(rawW.trim()),
      height: Number(rawH.trim()),
      sizeError: null,
    })
  },
  exportSvg: () => {
    const { svgContent, width, height, seed, sizeError } = get()
    if (sizeError || !isValidStoredSize(width, height)) {
      alert(`无法导出：${sizeError ?? '尺寸不在允许范围内'}，请修正画布尺寸后再试`)
      return
    }
    if (!svgContent) {
      alert('作品尚未生成，请稍候再试')
      return
    }
    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `art-${seed}-${width}x${height}.svg`; a.click()
    URL.revokeObjectURL(url)
  },
  exportPng: () => {
    const { svgContent, width, height, seed, sizeError } = get()
    if (sizeError || !isValidStoredSize(width, height)) {
      alert(`无法导出：${sizeError ?? '尺寸不在允许范围内'}，请修正画布尺寸后再试`)
      return
    }
    if (!svgContent) {
      alert('作品尚未生成，请稍候再试')
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = width; canvas.height = height
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(svgBlob)
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      canvas.toBlob(blob => {
        if (!blob) return
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `art-${seed}-${width}x${height}.png`; a.click()
      })
    }
    img.src = url
  },
}))
