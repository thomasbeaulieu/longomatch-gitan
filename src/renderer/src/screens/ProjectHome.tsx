import { useEffect, useState, type ReactElement } from 'react'
import type { ProjectDto } from '@shared/types'
import { useAppStore } from '../state/store'

function ProjectHome(): ReactElement {
  const openProject = useAppStore((s) => s.openProject)
  const goSeason = useAppStore((s) => s.goSeason)
  const [projects, setProjects] = useState<ProjectDto[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [videoPath, setVideoPath] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    window.houd
      .projectList()
      .then(setProjects)
      .finally(() => setLoading(false))
  }, [])

  async function handlePickVideo(): Promise<void> {
    const path = await window.houd.videoSelectFile()
    if (path) setVideoPath(path)
  }

  async function handleCreate(): Promise<void> {
    if (!name.trim() || !videoPath) return
    setCreating(true)
    setError(null)
    try {
      const data = await window.houd.projectCreate({ name: name.trim(), videoPath })
      openProject(data)
    } catch (err) {
      setError(String(err))
    } finally {
      setCreating(false)
    }
  }

  async function handleOpen(id: number): Promise<void> {
    const data = await window.houd.projectOpen(id)
    openProject(data)
  }

  async function handleDelete(id: number, name: string): Promise<void> {
    const confirmed = confirm(
      `Supprimer le projet "${name}" ? Tous les events, clips, playlists et stats associés seront perdus définitivement.`
    )
    if (!confirmed) return
    await window.houd.projectDelete(id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="project-home">
      <h1>Longomatch - Version Gitan</h1>

      <button className="season-view-btn" onClick={goSeason}>
        Voir la saison (tous les matchs)
      </button>

      <section className="new-project">
        <h2>Nouveau projet</h2>
        <input
          type="text"
          placeholder="Nom du match (ex: J12 vs Rennes)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handlePickVideo}>
          {videoPath ? 'Vidéo sélectionnée ✓' : 'Choisir une vidéo'}
        </button>
        {videoPath && <p className="video-path">{videoPath}</p>}
        <button disabled={!name.trim() || !videoPath || creating} onClick={handleCreate}>
          {creating ? 'Création...' : 'Créer le projet'}
        </button>
        {error && <p className="error">Erreur : {error}</p>}
      </section>

      <section className="project-list">
        <h2>Projets existants</h2>
        {loading && <p>Chargement...</p>}
        {!loading && projects.length === 0 && <p>Aucun projet pour l'instant.</p>}
        <ul>
          {projects.map((p) => (
            <li key={p.id} className="project-list-item">
              <button onClick={() => handleOpen(p.id)}>{p.name}</button>
              <button
                className="project-delete-btn"
                title="Supprimer ce projet"
                onClick={() => handleDelete(p.id, p.name)}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default ProjectHome
