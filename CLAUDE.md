# CLAUDE.md — Cockpit de Pilotage ACTE 1

> **Document unique de référence pour Claude Code**
> Tout le contexte, toutes les specs, toutes les instructions en un seul endroit.
> Dernière mise à jour : 7 mars 2026

---

## PARTIE 1 — CONTEXTE CLIENT

### Qui est ACTE 1 ?
- **Activité** : Bureau d'études en ingénierie audiovisuelle, scénographie technique, muséographie et acoustique
- **Dirigeants** : Amélie CHASSERIAUX & Régis LAMBLIN (binôme complémentaire)
- **Équipe** : 2 associés + 1 alternante
- **Localisation** : Ivry-sur-Seine (94)
- **CA** : En croissance, 300K€ → 450K€. Objectif de confort : 150K€/associé
- **Site web** : www.acte1.net
- **Contact** : contact@acte1.net

### Qui est le consultant ?
- **Grégory ALLAIN** — Alpha Z Production
- **Rôle** : Transformation digitale d'ACTE 1 (audit → déploiement)
- **Contact** : ga@alpha-z.eu / 06.71.36.69.27
- **TJM** : 1 400 € HT/jour
- **Style** : Autonome, direct, itératif, préfère les données réelles aux mocks

### Flux métier (processus MOP)
```
Sources Projets (AO publics + réseau privé/architectes)
  → Phase commerciale (candidature/offre ou devis)
    → Projet gagné & lancement
      → Phase études (DIAG/APS/APD/PRO/DCE)
        → Production livrables techniques & CCTP
          → Phase travaux (ACT/DET/AOR)
            → Suivi de chantier & réception
```

---

## PARTIE 2 — STACK TECHNIQUE

```
Framework    : Next.js 14 App Router (TypeScript strict)
Styling      : Tailwind CSS
Charts       : Recharts
Icons        : lucide-react
Deploy       : Vercel (via GitHub, auto-deploy sur push)
Data         : lib/data.ts (statique POC, branché Google Sheets après)
Theme        : Light/Dark toggle (light par défaut)
```

---

## PARTIE 3 — LOGIQUE CENTRALE

### Objectif
400K€ annuel par associé (paramétrable)

### Pondération mensuelle
Jan=1, Fév=1, Mar=1, Avr=1, Mai=1, Jun=1, Jul=0.5, Aoû=0.5, Sep=1, Oct=1, Nov=1, Déc=0.5
Somme = 10.5

### Calcul
- Objectif du mois M = 400K × (Poids_M / 10.5)
- Taux réalisation = Réalisé_cumulé / Objectif_cumulé_à_date
- Projection annuelle = Taux × Objectif_annuel

### Codes couleur
- Vert : réalisé >= 100% objectif
- Orange : 80-100%
- Rouge : < 80%
- Gris : mois passés (atténués)
- Violet : ligne objectif

---

## PARTIE 4 — VUES DU COCKPIT

1. Dashboard — KPIs, progression, alertes, graphiques mensuel/YTD
2. Forecast — Tableau projets détaillé avec codes couleur
3. Planning — Timeline dates initiale/révisée, impact tréso
4. Créances — Suivi factures et recouvrement
5. Paramètres — Objectif, seuils, pondérations, thème
