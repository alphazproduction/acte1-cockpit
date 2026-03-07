// ═══════════════════════════════════════════════════════════════
// ACTE 1 — IMPORT DES DONNÉES EXISTANTES
// Exécuter importerDonnees() après setupComplet()
// ═══════════════════════════════════════════════════════════════

function importerDonnees() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  importerProjets(ss);
  importerPrevisionnel2026(ss);

  SpreadsheetApp.flush();
  Logger.log('Import terminé — ' + DONNEES_PROJETS.length + ' projets + prévisionnel 2026');
}

// ── DONNÉES PROJETS (extraites du FORECAST Excel) ────────────────

var DONNEES_PROJETS = [
  ['palc-chalons', 'PALC - Chalons - Moatti', '', '', '', '', 'En cours', 118750, '', '', ''],
  ['roanne-dechelette', 'Roanne - Musée Dechelette', '', '', '', '', 'En cours', 47851, '', '', ''],
  ['rte-base-avenant', 'RTE : Base et Avenant', '', '', '', '', 'En cours', 42000, '', '', ''],
  ['oradour', "Centre de la Mémoire d'Oradour", '', '', '', '', 'En cours', 43650, '', '', ''],
  ['airbus-b25', 'AIRBUS - B25 - MOE', '', '', '', '', 'En cours', 69750, '', '', ''],
  ['insight-act2', 'Insight : ACT2 + DET + AOR', '', '', '', '', 'Attente signature contrat', 19950, '', '', ''],
  ['tour-first-n27', 'Tour First N27&N44', '', '', '', '', 'En cours', 29820, '', '', ''],
  ['26h-chantier', '26H - partie Chantier', '', '', '', '', 'En cours', 28975, '', '', ''],
  ['opus12-avenant', 'OPUS12 - Phase Etude sur avenant', '', '', '', '', 'À vérifier', 9500, '', '', 'Vérification avenant + ACT'],
  ['goodlife-1', 'GoodLife 1', '', '', '', '', 'Phases restantes', 37525, '', '', 'Reste le DET etc…'],
  ['ajn-falcon', 'AJN Falcon Nest', '', '', '', '', 'En cours', 0, '', '', ''],
  ['cc-notaires', 'CC Notaires', '', '', '', '', 'Attente contrat', 35500, '', '', ''],
  ['sgp-ardoines', 'SGP - Gare des Ardoines', '', '', '', '', 'En cours', 12825, '', '', ''],
  ['cheval-blanc-v2', 'Cheval Blanc v2', '', '', '', '', 'En cours', 29400, '', '', 'Validé par mail'],
  ['sg-29h', 'SG - 29H - Eclairage + DET', '', '', '', '', 'En cours', 10920, '', '', ''],
  ['cinema-bobigny', 'Cinéma Bobigny - Suite', '', '', '', '', 'En cours', 93196, '', '', 'Facturé N-1 : 43 434'],
  ['nausicaa', 'Nausicaa', '', '', '', '', 'En cours', 98766, '', '', ''],
  ['summit-affichage', 'SUMMIT : Affichage dynamique', '', '', '', '', 'En cours', 18800, '', '', ''],
  ['caudalie', 'Caudalie Base ERP + avenant SdR', '', '', '', '', 'À mettre à jour', 38400, '', '', 'Mise à jour forecast'],
  ['oceanopolis', 'Océanopolis - tranche ferme + cond.', '', '', '', '', 'En cours', 43650, '', '', ''],
  ['cinematheque-toulouse', 'Cinémathèque de Toulouse', '', '', '', '', 'En cours', 21017, '', '', ''],
  ['pb-complement-audito', 'Palais Bourbon - complément audito', '', '', '', '', 'À vérifier', 34359, '', '', 'Vérifier les montants'],
  ['pb-museo', 'Palais Bourbon Moatti - muséo', '', '', '', '', 'Attente OS', 136000, '', '', 'Attente OS avenant'],
  ['pace-rennes', 'PACE - Médiathèque de Rennes', '', '', '', '', 'Attente GPA', 23750, '', '', ''],
  ['nantes-histoire-naturelle', "Musée d'Histoire naturelle de Nantes", '', '', '', '', 'Attente signature contrat', 7300, '', '', ''],
  ['tour-first-cbre', 'Tour First CBRE', '', '', '', '', 'Clôture en cours', 17575, '', '', 'En attente fin AOR / réserves'],
  ['cheval-blanc-avenant', 'Cheval Blanc v2 - avenant serrurerie', '', '', '', '', 'En cours', 6300, '', '', ''],
  ['musee-armee', "Musée de l'Armée - Phase 1", '', '', '', '', 'Gelé', 30508, '', '', 'Gelé. Dernière facture ??'],
  ['manitou-suite', 'Manitou Suite', '', '', '', '', 'Attente paiement', 0, '', '', 'Reste : 30 625'],
  ['sgp-blanc-mesnil', 'SGP Gare de Blanc-Mesnil', '', '', '', '', 'Arrêté', 7600, '', '', 'Possiblement stoppé en 2024'],
  ['sg-renovation-auditoriums', 'SG - Rénovation des auditoriums MOE', '', '', '', '', 'En cours', 23800, '', '', ''],
  ['sg-valmy', 'SG - Complément Valmy écran fond de salle', '', '', '', '', 'En cours', 950, '', '', ''],
  ['bus-palladium', 'Bus Palladium', '', '', '', '', 'En cours', 0, '', '', 'Reste : 32 000'],
  ['sceaux', 'Sceaux', '', '', '', '', 'En cours', 0, '', '', 'Reste : 13 000'],
  ['sgp-blanc-mesnil-prog', 'SGP Gare Blanc-Mesnil - Phase programme', '', '', '', '', 'Arrêté', 7600, '', '', 'Possiblement stoppé en 2024'],
  ['propositions-en-cours', 'Montant des propositions en cours', '', '', '', '', 'En cours', 0, '', '', 'Reste : 45 000'],
  ['musee-armee-2', "Musée de l'Armée - Phase 2 (si dégel)", '', '', '', '', 'Gelé', 0, '', '', ''],
];

// ── DONNÉES PREVISIONNEL 2026 ────────────────────────────────────
// Format : [projet_id, Jan, Fév, Mar, Avr, Mai, Jun, Jul, Aoû, Sep, Oct, Nov, Déc]

var DONNEES_PREV_2026 = [
  ['palc-chalons',           0, 9565, 0, 7515, 0, 12525, 0, 0, 0, 21050, 0, 0],
  ['roanne-dechelette',      0, 0, 5575, 11551, 0, 0, 0, 0, 0, 0, 9975, 0],
  ['rte-base-avenant',       0, 0, 3675, 5250, 7875, 3150, 3150, 1575, 0, 0, 0, 0],
  ['oradour',                1627, 2826, 2709, 0, 7846, 0, 0, 0, 0, 0, 6068, 0],
  ['airbus-b25',             0, 0, 12255, 0, 8645, 0, 0, 0, 0, 0, 0, 0],
  ['insight-act2',           0, 3150, 0, 0, 0, 0, 0, 12075, 0, 0, 0, 4725],
  ['tour-first-n27',         0, 0, 7770, 0, 0, 2100, 6825, 0, 0, 0, 0, 2625],
  ['26h-chantier',           0, 0, 7600, 1425, 5035, 3800, 0, 0, 0, 0, 0, 0],
  ['opus12-avenant',         0, 11025, 0, 0, 5225, 0, 0, 0, 0, 0, 0, 0],
  ['goodlife-1',             10925, 0, 0, 4750, 0, 0, 0, 0, 0, 0, 0, 0],
  ['ajn-falcon',             0, 1570, 9135, 0, 0, 4620, 0, 0, 0, 0, 0, 0],
  ['cc-notaires',            0, 1500, 0, 0, 0, 0, 0, 0, 0, 8000, 0, 3500],
  ['sgp-ardoines',           0, 0, 0, 5540, 0, 0, 3850, 0, 0, 2200, 0, 0],
  ['cheval-blanc-v2',        0, 0, 1575, 5250, 0, 4200, 0, 0, 0, 0, 0, 0],
  ['sg-29h',                 0, 0, 3675, 2415, 0, 4830, 0, 0, 0, 0, 0, 0],
  ['cinema-bobigny',         0, 1850, 0, 3800, 3800, 0, 0, 0, 0, 0, 0, 0],
  ['nausicaa',               0, 0, 0, 0, 7901, 0, 0, 0, 0, 0, 0, 0],
  ['summit-affichage',       0, 0, 800, 0, 0, 0, 5400, 0, 0, 0, 0, 0],
  ['caudalie',               5775, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ['oceanopolis',            0, 1545, 1000, 1000, 1000, 1000, 0, 0, 0, 0, 0, 0],
  ['cinematheque-toulouse',  2662, 0, 1692, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ['pb-complement-audito',   1255, 627, 0, 0, 2971, 0, 0, 0, 0, 0, 0, 0],
  ['pb-museo',               1800, 900, 900, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ['pace-rennes',            0, 0, 0, 0, 0, 550, 0, 0, 0, 0, 0, 0],
  ['nantes-histoire-naturelle', 0, 3200, 0, 1500, 0, 400, 0, 0, 0, 0, 0, 0],
  ['tour-first-cbre',        0, 1425, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ['cheval-blanc-avenant',   0, 0, 1050, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ['musee-armee',            0, 1200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// ── IMPORT PROJETS ───────────────────────────────────────────────

function importerProjets(ss) {
  var sh = ss.getSheetByName('PROJETS');
  if (!sh) return;

  // Écrire toutes les lignes d'un coup (performant)
  sh.getRange(2, 1, DONNEES_PROJETS.length, DONNEES_PROJETS[0].length)
    .setValues(DONNEES_PROJETS);

  Logger.log(DONNEES_PROJETS.length + ' projets importés dans PROJETS');
}

// ── IMPORT PREVISIONNEL 2026 ─────────────────────────────────────

function importerPrevisionnel2026(ss) {
  var sh = ss.getSheetByName('PREVISIONNEL');
  if (!sh) return;

  // Construire les lignes : [année, projet_id, (vlookup laissé vide), Jan..Déc]
  // La colonne projet_nom (col 3) a déjà un VLOOKUP, on ne touche pas
  // On écrit : col A (année), col B (projet_id), cols D-O (mois)
  var rows = [];
  for (var i = 0; i < DONNEES_PREV_2026.length; i++) {
    var d = DONNEES_PREV_2026[i];
    // d[0] = projet_id, d[1..12] = Jan..Déc
    rows.push(d[0]); // on va écrire colonne par colonne
  }

  // Écrire année (col A) et projet_id (col B)
  for (var i = 0; i < DONNEES_PREV_2026.length; i++) {
    var row = 2 + i;
    sh.getRange(row, 1).setValue(2026);                    // année
    sh.getRange(row, 2).setValue(DONNEES_PREV_2026[i][0]); // projet_id
    // Col C (projet_nom) = VLOOKUP déjà en place, on ne touche pas
  }

  // Écrire les 12 mois d'un coup (cols D à O = cols 4 à 15)
  var moisData = [];
  for (var i = 0; i < DONNEES_PREV_2026.length; i++) {
    moisData.push(DONNEES_PREV_2026[i].slice(1)); // 12 valeurs
  }
  sh.getRange(2, 4, moisData.length, 12).setValues(moisData);

  Logger.log(DONNEES_PREV_2026.length + ' lignes importées dans PREVISIONNEL (2026)');
}
