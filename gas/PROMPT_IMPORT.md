# Prompt à coller dans Claude.ai avec les fichiers Excel attachés

---

Analyse le(s) fichier(s) Excel FORECAST ACTE 1 que je t'envoie.

Je veux que tu extraies TOUTES les données et que tu génères du code Google Apps Script prêt à coller.

## Structure de mon Google Sheet cible

### Onglet PROJETS — colonnes :
id | nom | client | responsable | type_marche | phase_courante | etat | honoraires_ht | date_debut | date_fin_prevue | notes

### Onglet PREVISIONNEL — colonnes :
annee | projet_id | projet_nom (auto) | Jan | Fév | Mar | Avr | Mai | Jun | Jul | Aoû | Sep | Oct | Nov | Déc | Total (auto)

### Onglet FACTURES — colonnes :
projet_id | projet_nom (auto) | numero | date_emission | montant_ht | date_echeance | date_encaissement | statut

## Règles de mapping

### Pour PROJETS :
- `id` : génère un slug à partir du nom (minuscule, tirets, sans accents). Ex: "Roanne - Musée Dechelette" → "roanne-dechelette"
- `nom` : nom exact tel qu'il apparaît dans le fichier
- `client` : extrais-le si disponible, sinon laisse vide
- `responsable` : vide (sera rempli manuellement)
- `type_marche` : vide (sera rempli manuellement)
- `phase_courante` : déduis-la de l'état ou du contexte si possible. Valeurs possibles : DIAG, ESQ, APS, APD, PRO, DCE, ACT, DET, AOR
- `etat` : mappe vers ces valeurs EXACTES uniquement :
  - "En cours" (pour tout ce qui est actif)
  - "Attente signature contrat"
  - "Attente contrat"
  - "Attente paiement"
  - "Attente GPA"
  - "Attente OS"
  - "À vérifier" (pour "vérification", "vérifier les montants", etc.)
  - "À mettre à jour" (pour "mise à jour forecast", etc.)
  - "Gelé" (pour "gelé", "bloqué")
  - "Arrêté" (pour "stoppé", "arrêté", "possiblement stoppé")
  - "Phases restantes" (pour "reste le DET", etc.)
  - "Clôture en cours" (pour "attente fin AOR", "réserves")
  - "Clos"
- `honoraires_ht` : nombre entier, 0 si absent
- `notes` : tout contexte utile qui ne rentre pas dans les autres colonnes (ancien état brut, commentaires, montants spéciaux)

### Pour PREVISIONNEL :
- Une ligne par projet PAR ANNÉE trouvée dans le fichier
- `annee` : l'année (2024, 2025, 2026...)
- `projet_id` : le même slug que dans PROJETS
- Mois Jan à Déc : montants entiers, 0 si vide
- Ne PAS inclure de lignes où tous les mois sont à 0

### Pour FACTURES :
- Si le fichier contient des données de facturation passée (facturé N-1, factures émises), extrais-les
- `statut` : "Payée" pour les factures passées, "Émise" pour les factures en cours

## Format de sortie attendu

Génère une SEULE fonction Google Apps Script `importerDonnees()` qui :
1. Écrit dans l'onglet PROJETS à partir de la ligne 2
2. Écrit dans l'onglet PREVISIONNEL à partir de la ligne 2 (colonnes A, B, D-O — ne pas toucher la colonne C qui a un VLOOKUP)
3. Écrit dans l'onglet FACTURES si des données existent

Format exact :

```javascript
function importerDonnees() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // ── PROJETS ──
  var projets = [
    ['slug-id', 'Nom du projet', 'Client', '', '', 'APD', 'En cours', 45000, '', '', 'Notes éventuelles'],
    // ... toutes les lignes
  ];
  var shProjets = ss.getSheetByName('PROJETS');
  shProjets.getRange(2, 1, projets.length, projets[0].length).setValues(projets);

  // ── PREVISIONNEL ──
  // Col A = année, Col B = projet_id, Col C = VLOOKUP (ne pas toucher)
  var prevAnnees = [];  // [année, projet_id]
  var prevMois = [];    // [Jan, Fév, ..., Déc] (12 colonnes)

  prevAnnees.push([2026, 'slug-id']);
  prevMois.push([0, 5000, 3000, 0, 8000, 0, 0, 0, 0, 0, 0, 0]);
  // ... toutes les lignes

  var shPrev = ss.getSheetByName('PREVISIONNEL');
  shPrev.getRange(2, 1, prevAnnees.length, 2).setValues(prevAnnees);
  shPrev.getRange(2, 4, prevMois.length, 12).setValues(prevMois);

  // ── FACTURES (si données disponibles) ──
  // ...

  Logger.log('Import terminé');
}
```

## Important
- N'invente AUCUNE donnée. Si un champ n'est pas dans le fichier, laisse-le vide ('')
- Inclus TOUS les projets, même ceux à 0€
- Si tu trouves des données pour plusieurs années, crée des lignes pour chaque année dans PREVISIONNEL
- Les montants sont en euros HT, nombres entiers (pas de décimales)
- Signale-moi les données ambiguës ou les lignes que tu n'as pas pu interpréter
