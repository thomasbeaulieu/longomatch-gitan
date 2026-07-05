import type { ReactElement } from 'react'
import { useAppStore } from './state/store'
import ProjectHome from './screens/ProjectHome'
import TaggingWorkspace from './screens/TaggingWorkspace'
import SeasonView from './screens/SeasonView'

function App(): ReactElement {
  const view = useAppStore((s) => s.view)

  if (view === 'home') return <ProjectHome />
  if (view === 'season') return <SeasonView />
  return <TaggingWorkspace />
}

export default App
