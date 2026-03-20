# CLAUDE.md — Cockpit de Pilotage ACTE 1

> **Document unique de référence pour Claude Code**
> Tout le contexte, toutes les specs, toutes les instructions en un seul endroit.
> Dernière mise à jour : 20 mars 2026

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
- **Interlocuteur client** : Philippe Du Peyrat (retours fonctionnels)

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
Styling      : Tailwind CSS (CSS custom properties : --border, --bg-card, --accent, etc.)
Charts       : Recharts (BarChart, AreaChart, ReferenceLine)
Icons        : lucide-react
Deploy       : Vercel (via GitHub auto-deploy sur push main)
Repo         : github.com/alphazproduction/acte1-cockpit (branche main)
Data         : lib/data.ts (POC statique) + lib/data-provider.ts (Live Google Sheets via GAS API)
Config       : lib/config.ts (localStorage pour objectif, pondérations, nb associés, sous-traitance)
Theme        : Light/Dark toggle (light par défaut)
```

---

## PARTIE 3 — LOGIQUE CENTRALE

### Objectif
- Objectif par associé : 400K€/an (paramétrable dans Paramètres)
- Nombre d'associés : 2 (paramétrable)
- **Objectif global** = objectif par associé × nombre d'associés = 800K€
- Fonctions : `getObjectifAnnuel()`, `getNombreAssocies()`, `getObjectifGlobal()` dans lib/config.ts

### Pondération mensuelle
Jan=1, Fév=1, Mar=1, Avr=1, Mai=1, Jun=1, Jul=0.5, Aoû=0.5, Sep=1, Oct=1, Nov=1, Déc=0.5
Somme = 10.5 (paramétrable)

### Calcul
- Objectif du mois M = ObjectifGlobal × (Poids_M / SommePoids)
- Taux réalisation = Réalisé_cumulé / Objectif_cumulé_à_date
- Projection annuelle = Taux × ObjectifGlobal
- Fonctions : `objectifMois()`, `objectifCumule()`, `tempsEcoulePondere()` dans lib/utils.ts

### Projections multi-années
- `computeProjection(projet, annee)` dans lib/data.ts
- Pour 2026 : utilise les données `mois[]` et `total_2026` du projet
- Pour 2027+ : ventile `reste - total_2026` uniformément de janvier à `fin_revisee` du projet
- Helpers : `getProjetMois(p, annee)`, `getProjetTotal(p, annee)`, `getTotauxMois(annee)`

### Mois courant
- `MOIS_COURANT_INDEX = 2` (Mars, 0-indexed) dans lib/utils.ts
- À mettre à jour chaque mois

### Codes couleur
- Vert : réalisé >= 100% objectif
- Orange : 80-100%
- Rouge : < 80%
- Gris : mois passés (atténués)
- Violet : mois courant / ligne objectif

---

## PARTIE 4 — VUES DU COCKPIT

### 1. Dashboard (`app/page.tsx`)
- Navigation année 2024-2028 avec badge "Année en cours"
- KPIs condensés : objectif/prévu avec badge vert/rouge %, reste année/global, projection
- Top 5 projets avec toggle "CA restant (année)" / "CA restant (global)"
- Graphiques : bar chart mensuel + YTD cumulé, avec légende couleur
- Alertes opérationnelles

### 2. Forecast (`app/forecast/page.tsx`)
- Tableau détaillé projets × 12 mois avec totaux
- Colonnes triables (SortHeader + tri inline par projet/mois/total)
- Navigation année 2025-2028
- Sparklines par projet
- Footer : totaux vs objectifs pondérés avec codes couleur

### 3. Planning (`app/planning/page.tsx`)
- Timeline dates initiale/révisée, delta
- Colonnes triables (useSort hook)
- Honoraires, statut par projet

### 4. Échéancier (`app/echeances/page.tsx`)
- Regroupement par projet avec trigramme badge violet
- Types d'échéances : Acompte, Situation, Solde, Avance, Retenue de garantie
- KPIs : total à encaisser, en retard, prochaine échéance
- Sections collapsibles par projet

### 5. Créances (`app/creances/page.tsx`)
- Suivi factures et recouvrement

### 6. Nouveau projet (`app/projets/nouveau/page.tsx`)
- Informations générales : code trigramme (auto-suggestion), nom, état, honoraires, facturé N-1
- **Client & acteurs** : client MOA + société, architecte/MOE + société, interlocuteurs dynamiques (ajout/suppression) avec rôle/société/email
- Base sociétés persistante (localStorage `societes-connues`, datalist autocomplétion)
- Dates : début, fin initiale, fin révisée
- Prévisionnel mensuel 2026 (grille 12 mois)
- **Échéancier par phases** : DIAG/APS/APD/PRO/DCE/ACT/DET/AOR pré-remplis + phases custom
  - Toggle €/% avec sync automatique montant ↔ pourcentage
  - Mois prévu + checkbox facturé + mois facturé réel
  - Vérification cohérence vs honoraires totaux

### 7. Paramètres (`app/parametres/page.tsx`)
- Objectif par associé + nombre d'associés → objectif global calculé
- Prévisionnel sous-traitance
- Pondérations mensuelles (sliders)
- URL Google Sheets
- Thème light/dark

### 8. Aide (`app/aide/page.tsx`)
- Documentation fonctionnelle intégrée

---

## PARTIE 5 — COMPOSANTS PARTAGÉS

- `components/Sidebar.tsx` — Navigation latérale (Échéances renommé → Échéancier)
- `components/SortHeader.tsx` — En-tête de colonne triable (chevron up/down)
- `components/SparkLine.tsx` — Mini graphique en ligne
- `components/ProjetTooltip.tsx` — Tooltip hover sur trigramme projet
- `components/BarChartMensuel.tsx` — Bar chart mensuel (year-aware, prop `annee`)
- `components/ChartYTD.tsx` — Graphique cumulé YTD (year-aware)
- `components/KpiCard.tsx` — Carte KPI réutilisable
- `components/SourceTag.tsx` — Tag source données
- `components/Topbar.tsx` — Barre titre + sous-titre

---

## PARTIE 6 — HOOKS & UTILITAIRES

- `lib/useData.ts` — Hook chargement données (POC/Live mode)
- `lib/useSort.ts` — Hook générique tri colonnes (sorted, sortKey, sortDir, requestSort)
- `lib/data-provider.ts` — Abstraction POC (statique) / Live (Google Sheets API)
- `lib/config.ts` — Config persistante localStorage (objectif, associés, pondérations, sous-traitance, URL sheet)
- `lib/utils.ts` — Formatage (fmt, fmtK, fmtPct), calculs objectifs, statuts projet, alertes, couleurs
- `lib/data.ts` — Données POC, types Projet, projection multi-années

---

## PARTIE 7 — ÉTAT & RESTE À FAIRE

### Fait (20 mars 2026)
- Dashboard avec navigation multi-année, KPIs condensés, Top 5 toggle, légende graphiques
- Forecast/Planning avec colonnes triables
- Projections dynamiques 2027+ basées sur fin_revisee
- Échéancier regroupé par projet avec types
- Paramètres : nb associés × objectif, sous-traitance
- Nouveau projet enrichi : client/acteurs/interlocuteurs + échéancier par phases métier
- Toggle POC/Live pour données Google Sheets
- Base sociétés persistante avec autocomplétion
- Déployé sur Vercel (acte1-cockpit.vercel.app)

### Reste à faire
- Années passées : vue « prévu vs réalisé » consolidée
- Validation cohérence données (prévu + reste ≈ projection)
- Base sociétés dans Google Sheet (actuellement localStorage uniquement)
- Branchement complet Live Google Sheets (GAS API déjà structuré)
- MOIS_COURANT_INDEX à rendre dynamique (actuellement hardcodé à 2 = Mars)
