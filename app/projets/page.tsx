import { STATS_GLOBALES } from '@/lib/data'
import Topbar from '@/components/Topbar'
import ProjectTable from '@/components/ProjectTable'

export default function ProjetsPage() {
  return (
    <>
      <Topbar
        title="Portefeuille"
        subtitle={`${STATS_GLOBALES.nb_projets_actifs} projets actifs · source : FORECAST 2026`}
      />
      <ProjectTable />
    </>
  )
}
