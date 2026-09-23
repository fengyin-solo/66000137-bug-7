import { useLayoutEffect, useRef, useState } from 'react'
import { useDesignStore } from '../store/design'
import { renderArt } from '../lib/render'
import type { DesignParams } from '../types'

/** 参与生成的参数：变化时才需要重建 SVG，窗口缩放不在其中 */
const ART_DEP_KEYS: (keyof DesignParams)[] = [
  'pattern', 'seed', 'iterations', 'scale', 'rotation',
  'strokeWidth', 'opacity', 'bgColor', 'palette', 'width', 'height',
]

export default function ArtCanvas() {
  // 可用内容区域（不含父容器 padding）；由 ResizeObserver 持续更新，
  // 窗口拖动/恢复、折叠布局变化后都会重新排布
  const areaRef = useRef<HTMLDivElement>(null)
  const [area, setArea] = useState({ width: 0, height: 0 })
  const store = useDesignStore()
  const { width, height } = store

  useLayoutEffect(() => {
    const el = areaRef.current
    if (!el) return
    const measure = () => setArea({ width: el.clientWidth, height: el.clientHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // 等比缩放到可用空间内（contain），不改变画布逻辑尺寸，
  // 因此构图与导出的 SVG/PNG 成品始终一致
  const scale = area.width > 0 && area.height > 0
    ? Math.min(area.width / width, area.height / height)
    : 0
  const fitWidth = Math.floor(width * scale)
  const fitHeight = Math.floor(height * scale)

  // 仅当设计参数（含画布尺寸档位）变化时重建 artwork；
  // 预览缩放只改外层 div 的 CSS 尺寸，不触发生成、不改存盘内容。
  // 使用 layout effect：尺寸档位切换后在浏览器绘制前完成替换，避免一帧旧尺寸画面
  useLayoutEffect(() => {
    store.setSvgContent(renderArt(store))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, ART_DEP_KEYS.map(k => store[k]))

  const ready = fitWidth > 0 && fitHeight > 0

  return (
    <div ref={areaRef} className="relative w-full h-full min-w-0 min-h-0">
      {ready && (
        <>
          <div
            className="art-stage shadow-2xl rounded border border-gray-700 overflow-hidden bg-black/40"
            style={{
              width: fitWidth,
              height: fitHeight,
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            // SVG 自带 width/height/viewBox（逻辑尺寸即存盘尺寸），
            // 这里经 CSS 拉满外层容器仅影响屏幕显示，不影响成品
            dangerouslySetInnerHTML={{ __html: store.svgContent }}
          />
          <div className="absolute left-2 top-2 rounded bg-black/60 px-2 py-1 text-[11px] text-gray-300 pointer-events-none">
            画布 {width} × {height}px · 显示 {fitWidth} × {fitHeight}px（{Math.round(scale * 100)}%）
          </div>
        </>
      )}
    </div>
  )
}
