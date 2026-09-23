import ArtCanvas from './components/ArtCanvas'
import Sidebar from './components/Sidebar'

export default function App() {
  return (
    <div className="flex w-full h-full">
      <div className="flex-1 min-w-0 flex items-center justify-center bg-gray-950 overflow-hidden p-6">
        <ArtCanvas />
      </div>
      <Sidebar />
    </div>
  )
}
