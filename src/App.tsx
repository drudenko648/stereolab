import { Scene } from './three/Scene'
import { ControlPanel } from './ui/ControlPanel'

function App() {
  return (
    <div className="flex h-full w-full bg-slate-100 text-slate-900">
      <aside className="w-80 shrink-0 overflow-y-auto border-r border-slate-300 bg-white">
        <ControlPanel />
      </aside>
      <main className="relative flex-1" data-testid="scene">
        <Scene />
      </main>
    </div>
  )
}

export default App
