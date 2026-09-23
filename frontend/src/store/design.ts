import { create } from 'zustand'
import type { DesignParams, PatternType } from '../types'
import { THEMES } from '../themes/palettes'
import { MIN_SIZE, MAX_SIZE, parseSize } from '../config/sizes'
import { renderArt } from '../lib/render'

interface DesignStore extends DesignParams {
  svgContent: string
  /** 尺寸输入的校验提示；为空表示当前尺寸合法 */
  sizeError: string | null
  setParam: <K extends keyof DesignParams>(key: K, value: DesignParams[K]) => void
  setPattern: (p: PatternType) => void
  setTheme: (id: string) => void
  randomSeed: () => void
  setSvgContent: (s: string) => void
  /** 应用尺寸档位，尺寸必然合法 */
  setSizePreset: (width: number, height: number) => void
  /** 应用自定义尺寸；缺失或越界时返回 false 并写入 sizeError，不改动既有尺寸 */
  setDimensions: (rawWidth: string, rawHeight: string) => boolean
  exportSvg: () => void
  exportPng: () => void
}

function isValidDimension(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n) &&
    Number.isInteger(n) && n >= MIN_SIZE && n <= MAX_SIZE
}

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
  width: 800,
  height: 1000,
  svgContent: '',
  sizeError: null,
  setParam: (key, value) => {
    // 画布尺寸必须走校验入口，不允许从这里悄悄写入非法/固定值
    if (key === 'width' || key === 'height') return
    set({ [key]: value } as any)
  },
  setPattern: (p) => set({ pattern: p }),
  setTheme: (id) => {
    const theme = THEMES.find(t => t.id === id)
    if (theme) set({ palette: theme.colors })
  },
  randomSeed: () => set({ seed: Math.floor(Math.random() * 99999) }),
  setSvgContent: (s) => set({ svgContent: s }),
  setSizePreset: (width, height) => {
    if (!isValidDimension(width) || !isValidDimension(height)) {
      set({ sizeError: `尺寸需在 ${MIN_SIZE}–${MAX_SIZE} 之间` })
      return
    }
    set({ width, height, sizeError: null })
  },
  setDimensions: (rawWidth, rawHeight) => {
    const w = parseSize(rawWidth, '宽度')
    const h = parseSize(rawHeight, '高度')
    if (!w.ok || !h.ok) {
      set({ sizeError: w.error ?? h.error ?? '尺寸无效' })
      return false
    }
    set({ width: w.value, height: h.value, sizeError: null })
    return true
  },
  exportSvg: () => {
    const { svgContent } = get()
    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `art-${get().seed}.svg`; a.click()
    URL.revokeObjectURL(url)
  },
  exportPng: () => {
    // 始终以当前设置的画布逻辑尺寸出图，与预览同源
    const { width, height, seed } = get()
    const svgContent = renderArt(get())
    const canvas = document.createElement('canvas')
    canvas.width = width; canvas.height = height
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(svgBlob)
    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      canvas.toBlob(blob => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob!)
        a.download = `art-${seed}.png`; a.click()
      })
    }
    img.src = url
  },
}))
