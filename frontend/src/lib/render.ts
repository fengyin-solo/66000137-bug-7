import type { DesignParams } from '../types'
import {
  createRng,
  generateSpiral,
  generateFractal,
  generateWave,
  generateCircles,
  generateNoise,
} from '../generators/patterns'

function buildArtContent(p: DesignParams): string {
  const rng = createRng(p.seed)
  const { width: w, height: h, pattern, iterations, scale, palette, strokeWidth, opacity } = p
  switch (pattern) {
    case 'spiral':  return generateSpiral(w, h, iterations, scale, palette, rng, strokeWidth, opacity)
    case 'fractal': return generateFractal(w, h, iterations, scale, palette, rng, strokeWidth, opacity)
    case 'wave':    return generateWave(w, h, iterations, scale, palette, rng, strokeWidth, opacity)
    case 'circles': return generateCircles(w, h, iterations, scale, palette, rng, strokeWidth, opacity)
    case 'noise':   return generateNoise(w, h, iterations, scale, palette, rng, strokeWidth, opacity)
    default:        return ''
  }
}

/**
 * 预览与存盘共用的唯一渲染入口：
 * 逻辑尺寸（width/height 属性 + viewBox）始终来自同一份设计参数，
 * 因此预览面板里看到的构图与 SVG/PNG 成品完全一致。
 * 预览时的屏幕缩放只通过 CSS width/height 完成，不改变这里的输出。
 */
export function renderArt(p: DesignParams): string {
  const { width, height, rotation, bgColor } = p
  const content = buildArtContent(p)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${bgColor}"/>
  <g transform="rotate(${rotation},${width / 2},${height / 2})">${content}</g>
</svg>`
}
