import { useEffect, useRef, useState } from 'react'
import { useDesignStore } from '../store/design'
import { createRng, generateSpiral, generateFractal, generateWave, generateCircles, generateNoise } from '../generators/patterns'

/**
 * 画布尺寸（width/height）是预览与导出共享的唯一一份设置：
 * - 生成的 SVG 带固定 width/height 与 viewBox，作为导出成品
 * - 预览只通过 CSS 等比缩放（contain 适配可用空间），不改坐标，构图与成品一致
 * - 容器尺寸变化（窗口拖拽/侧栏变化）或档位切换都会重新排布
 */
export default function ArtCanvas() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const store = useDesignStore()

  // 等比适配：SVG 的 viewBox 不变，只改 CSS 显示尺寸
  function relayout() {
    const viewport = viewportRef.current
    const wrapper = wrapperRef.current
    if (!viewport || !wrapper) return
    const svgEl = wrapper.querySelector('svg') as SVGSVGElement | null
    if (!svgEl) return

    const { width, height } = store
    const availW = viewport.clientWidth
    const availH = viewport.clientHeight
    if (availW <= 0 || availH <= 0) return

    const ratio = Math.min(availW / width, availH / height)
    const displayW = Math.floor(width * ratio)
    const displayH = Math.floor(height * ratio)

    wrapper.style.width = `${displayW}px`
    wrapper.style.height = `${displayH}px`
    svgEl.style.width = `${displayW}px`
    svgEl.style.height = `${displayH}px`
    svgEl.style.display = 'block'
    setScale(ratio)
  }

  // 1) 按设计参数（含 width/height 档位）重新生成 SVG，同步给预览与导出
  useEffect(() => {
    const rng = createRng(store.seed)
    const { width, height, pattern, iterations, scale, palette, strokeWidth, opacity, bgColor, rotation } = store
    let content = ''
    switch (pattern) {
      case 'spiral':  content = generateSpiral(width, height, iterations, scale, palette, rng, strokeWidth, opacity); break
      case 'fractal': content = generateFractal(width, height, iterations, scale, palette, rng, strokeWidth, opacity); break
      case 'wave':    content = generateWave(width, height, iterations, scale, palette, rng, strokeWidth, opacity); break
      case 'circles': content = generateCircles(width, height, iterations, scale, palette, rng, strokeWidth, opacity); break
      case 'noise':   content = generateNoise(width, height, iterations, scale, palette, rng, strokeWidth, opacity); break
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${bgColor}"/>
  <g transform="rotate(${rotation},${width/2},${height/2})">${content}</g>
</svg>`
    store.setSvgContent(svg)
    if (wrapperRef.current) {
      wrapperRef.current.innerHTML = svg
      relayout()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.pattern, store.seed, store.iterations, store.scale, store.rotation,
      store.strokeWidth, store.opacity, store.bgColor, store.palette, store.width, store.height])

  // 2) 监听可用空间变化：窗口缩放/恢复后重新排布，恢复到与空间匹配的布局
  useEffect(() => {
    relayout()
    const viewport = viewportRef.current
    if (!viewport) return
    const observer = new ResizeObserver(() => relayout())
    observer.observe(viewport)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.width, store.height])

  return (
    <div ref={viewportRef} className="w-full h-full flex items-center justify-center overflow-hidden">
      <div className="relative">
        <div
          ref={wrapperRef}
          className="shadow-2xl rounded border border-gray-700 bg-black overflow-hidden"
        />
        <div className="absolute left-2 bottom-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-gray-300 pointer-events-none">
          {store.width} × {store.height}{scale < 0.999 ? ` · 适配 ${Math.round(scale * 100)}%` : ''}
        </div>
      </div>
    </div>
  )
}
