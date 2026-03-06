import Topbar from '@/components/Topbar'
import OnboardingForm from '@/components/OnboardingForm'

export default function NouveauPage() {
  return (
    <>
      <Topbar
        title="Nouveau projet"
        subtitle="Onboarding automatisé — Dossier + Fiche + Forecast"
      />
      <OnboardingForm />
    </>
  )
}
