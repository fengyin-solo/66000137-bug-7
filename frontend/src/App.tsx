import ArtCanvas from './components/ArtCanvas'
import Sidebar from './components/Sidebar'

export default function App() {
  return (
    <div className="flex w-full h-full">
      {/* min-w-0 保证 flex 子项可以收缩，画布在内部按可用空间等比适配，
          不再溢出裁切；窗口变化由 ResizeObserver 驱动重新排布 */}
      <div className="flex-1 min-w-0 flex items-center justify-center bg-gray-950 overflow-hidden p-6">
        <ArtCanvas />
      </div>
      <Sidebar />
    </div>
  )
}
