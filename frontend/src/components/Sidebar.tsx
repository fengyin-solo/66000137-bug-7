import { useEffect, useState } from 'react'
import { useDesignStore } from '../store/design'
import { THEMES } from '../themes/palettes'
import { SIZE_PRESETS } from '../config/sizes'
import type { PatternType } from '../types'

const PATTERNS: { value: PatternType; label: string }[] = [
  { value: 'spiral',  label: '🌀 螺旋' },
  { value: 'fractal', label: '🌳 分形树' },
  { value: 'wave',    label: '🌊 波浪' },
  { value: 'circles', label: '⭕ 圆环' },
  { value: 'noise',   label: '🎲 噪声场' },
]

export default function Sidebar() {
  const store = useDesignStore()

  // 自定义尺寸的输入草稿：合法应用后与 store 同步；
  // 非法输入只停留在草稿与错误提示里，不会改动画布/存盘尺寸
  const [widthDraft, setWidthDraft] = useState(String(store.width))
  const [heightDraft, setHeightDraft] = useState(String(store.height))
  useEffect(() => {
    if (!store.sizeError) {
      setWidthDraft(String(store.width))
      setHeightDraft(String(store.height))
    }
  }, [store.width, store.height, store.sizeError])

  const commitSize = () => store.setDimensions(widthDraft, heightDraft)
  const activePreset = SIZE_PRESETS.find(
    p => p.width === store.width && p.height === store.height
  )

  return (
    <div className="w-72 shrink-0 bg-gray-900 border-l border-gray-700 p-4 overflow-y-auto flex flex-col gap-4">
      <h2 className="text-lg font-bold">🎨 SVG 海报设计器</h2>

      {/* Pattern */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">图案类型</label>
        <div className="grid grid-cols-2 gap-2">
          {PATTERNS.map(p => (
            <button key={p.value} onClick={() => store.setPattern(p.value)}
              className={`px-2 py-1.5 rounded text-xs font-medium ${store.pattern===p.value?'bg-indigo-600':'bg-gray-700 hover:bg-gray-600'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">颜色主题</label>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map(t => (
            <button key={t.id} onClick={() => store.setTheme(t.id)}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-700 hover:bg-gray-600">
              <div className="flex">{t.colors.map((c,i) => (
                <div key={i} style={{background:c}} className="w-3 h-3 rounded-full" />
              ))}</div>
              <span>{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Size: 画布尺寸即存盘尺寸，预览与成品共用 */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">
          画布尺寸（预览自动适配 · 存盘同此尺寸）
        </label>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {SIZE_PRESETS.map(p => (
            <button key={p.id} onClick={() => store.setSizePreset(p.width, p.height)}
              className={`px-1 py-1.5 rounded text-[11px] font-medium ${activePreset?.id===p.id?'bg-indigo-600':'bg-gray-700 hover:bg-gray-600'}`}>
              {p.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number" value={widthDraft}
            onChange={e => setWidthDraft(e.target.value)}
            onBlur={commitSize}
            onKeyDown={e => { if (e.key === 'Enter') commitSize() }}
            aria-label="画布宽度"
            className={`w-full bg-gray-800 rounded px-2 py-1 text-xs outline-none ${store.sizeError ? 'border border-rose-500' : 'border border-gray-700 focus:border-indigo-500'}`}
          />
          <span className="text-gray-500 text-xs">×</span>
          <input
            type="number" value={heightDraft}
            onChange={e => setHeightDraft(e.target.value)}
            onBlur={commitSize}
            onKeyDown={e => { if (e.key === 'Enter') commitSize() }}
            aria-label="画布高度"
            className={`w-full bg-gray-800 rounded px-2 py-1 text-xs outline-none ${store.sizeError ? 'border border-rose-500' : 'border border-gray-700 focus:border-indigo-500'}`}
          />
          <span className="text-gray-500 text-xs whitespace-nowrap">px</span>
        </div>
        {store.sizeError && (
          <p className="text-[11px] text-rose-400 mt-1">⚠️ {store.sizeError}</p>
        )}
      </div>

      {/* Seed */}
      <div>
        <label className="text-xs text-gray-400">种子: {store.seed}</label>
        <div className="flex gap-2 mt-1">
          <input type="range" min={0} max={99999} value={store.seed}
            onChange={e => store.setParam('seed', Number(e.target.value))} className="flex-1 accent-indigo-500" />
          <button onClick={() => store.randomSeed()} className="px-2 bg-indigo-600 rounded text-xs">🎲</button>
        </div>
      </div>

      {/* Iterations */}
      <div>
        <label className="text-xs text-gray-400">迭代数: {store.iterations}</label>
        <input type="range" min={10} max={500} step={10} value={store.iterations}
          onChange={e => store.setParam('iterations', Number(e.target.value))} className="w-full accent-purple-500" />
      </div>

      {/* Scale */}
      <div>
        <label className="text-xs text-gray-400">缩放: {store.scale.toFixed(2)}</label>
        <input type="range" min={0.1} max={3} step={0.1} value={store.scale}
          onChange={e => store.setParam('scale', Number(e.target.value))} className="w-full accent-green-500" />
      </div>

      {/* Rotation */}
      <div>
        <label className="text-xs text-gray-400">旋转: {store.rotation}°</label>
        <input type="range" min={0} max={360} step={5} value={store.rotation}
          onChange={e => store.setParam('rotation', Number(e.target.value))} className="w-full accent-yellow-500" />
      </div>

      {/* Stroke */}
      <div>
        <label className="text-xs text-gray-400">描边: {store.strokeWidth.toFixed(1)}</label>
        <input type="range" min={0.5} max={5} step={0.5} value={store.strokeWidth}
          onChange={e => store.setParam('strokeWidth', Number(e.target.value))} className="w-full accent-orange-500" />
      </div>

      {/* Opacity */}
      <div>
        <label className="text-xs text-gray-400">透明度: {store.opacity.toFixed(2)}</label>
        <input type="range" min={0.1} max={1} step={0.05} value={store.opacity}
          onChange={e => store.setParam('opacity', Number(e.target.value))} className="w-full accent-pink-500" />
      </div>

      {/* Export */}
      <div className="flex gap-2 mt-2">
        <button onClick={() => store.exportSvg()} className="flex-1 py-2 bg-teal-600 rounded text-sm font-medium">⬇ SVG</button>
        <button onClick={() => store.exportPng()} className="flex-1 py-2 bg-rose-600 rounded text-sm font-medium">⬇ PNG</button>
      </div>
    </div>
  )
}
