// ═══════════════════════════════════════════════════════════════
// ACTE 1 — COCKPIT · Google Apps Script
// Exécuter setupComplet() pour initialiser le document
// ═══════════════════════════════════════════════════════════════

// ── CONSTANTES ──────────────────────────────────────────────────

var COULEURS = {
  headerClair: '#e8e4db',
  headerTextClair: '#1a1c20',
  bordureClair: '#d0cdc6',
  muted: '#8a8f9e',
  gold: '#c9a96e',
  green: '#4caf82',
};

var ETATS = [
  'En cours',
  'Attente signature contrat',
  'Attente contrat',
  'Attente paiement',
  'Attente GPA',
  'Attente OS',
  'À vérifier',
  'À mettre à jour',
  'Gelé',
  'Arrêté',
  'Phases restantes',
  'Clôture en cours',
  'Clos',
];

var PHASES_MOP = ['DIAG', 'ESQ', 'APS', 'APD', 'PRO', 'DCE', 'ACT', 'DET', 'AOR'];
var TYPES_MARCHE = ['Public', 'Privé', 'Semi-public', 'Concours'];
var RESPONSABLES = ['Amélie', 'Régis', 'Les deux'];
var STATUTS_FACTURE = ['Émise', 'Payée', 'Relancée', 'En litige', 'Annulée'];
var STATUTS_PIPELINE = ['Identifié', 'En réponse', 'Soumis', 'Gagné', 'Perdu'];
var PROBABILITES = ['25%', '50%', '75%', '90%'];
var MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
var ANNEES = [2024, 2025, 2026];

// ── FONCTION PRINCIPALE ──────────────────────────────────────────

function setupComplet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Supprimer les feuilles existantes sauf la première
  var sheets = ss.getSheets();
  for (var i = sheets.length - 1; i >= 1; i--) {
    ss.deleteSheet(sheets[i]);
  }

  creerOngletConfig(ss);
  creerOngletProjets(ss);
  creerOngletPhases(ss);
  creerOngletPrevisionnel(ss);
  creerOngletEcheancier(ss);
  creerOngletFactures(ss);
  creerOngletPipeline(ss);
  creerOngletContacts(ss);
  creerOngletCharges(ss);

  // Supprimer la feuille vide initiale
  var first = ss.getSheets()[0];
  var firstName = first.getName();
  if (firstName === 'Feuille 1' || firstName === 'Sheet1' || firstName === 'Feuille1') {
    ss.deleteSheet(first);
  }

  // Réordonner
  var ordre = ['CONFIG', 'PROJETS', 'PHASES', 'PREVISIONNEL', 'ECHEANCIER', 'FACTURES', 'PIPELINE', 'CONTACTS', 'CHARGES'];
  for (var o = 0; o < ordre.length; o++) {
    var sh = ss.getSheetByName(ordre[o]);
    if (sh) {
      ss.setActiveSheet(sh);
      ss.moveActiveSheet(o + 1);
    }
  }

  ss.setActiveSheet(ss.getSheetByName('PROJETS'));
  SpreadsheetApp.flush();
  Logger.log('Setup ACTE 1 Cockpit terminé — 9 onglets créés');
}

// ── HELPERS ──────────────────────────────────────────────────────

function creerOuRecuperer(ss, nom) {
  var sh = ss.getSheetByName(nom);
  if (!sh) sh = ss.insertSheet(nom);
  return sh;
}

function appliquerStyle(sheet, headers, largeurs) {
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setBackground(COULEURS.headerClair);
  headerRange.setFontColor(COULEURS.headerTextClair);
  headerRange.setFontFamily('DM Mono');
  headerRange.setFontSize(10);
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  sheet.setRowHeight(1, 36);
  sheet.setFrozenRows(1);

  for (var i = 0; i < largeurs.length; i++) {
    sheet.setColumnWidth(i + 1, largeurs[i]);
  }

  sheet.getRange(2, 1, sheet.getMaxRows() - 1, headers.length)
    .setFontFamily('Outfit')
    .setFontSize(10)
    .setVerticalAlignment('middle');

  headerRange.setBorder(null, null, true, null, null, null, COULEURS.bordureClair, SpreadsheetApp.BorderStyle.SOLID);
}

function ajouterValidation(sheet, colonne, liste, ligneDebut, ligneFin) {
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(liste, true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(ligneDebut, colonne, ligneFin - ligneDebut + 1, 1).setDataValidation(rule);
}

function fmtNombre(sheet, colonne, ligneDebut, ligneFin) {
  sheet.getRange(ligneDebut, colonne, ligneFin - ligneDebut + 1, 1).setNumberFormat('#,##0');
}

function fmtDate(sheet, colonne, ligneDebut, ligneFin) {
  sheet.getRange(ligneDebut, colonne, ligneFin - ligneDebut + 1, 1).setNumberFormat('yyyy-MM-dd');
}

function fmtPourcent(sheet, colonne, ligneDebut, ligneFin) {
  sheet.getRange(ligneDebut, colonne, ligneFin - ligneDebut + 1, 1).setNumberFormat('0%');
}

function ajouterVlookupNom(sheet, colNom, colId, ligneDebut, ligneFin) {
  var formulas = [];
  for (var r = ligneDebut; r <= ligneFin; r++) {
    var idRef = String.fromCharCode(64 + colId) + r;
    formulas.push(['=IF(' + idRef + '="","",IFERROR(VLOOKUP(' + idRef + ',PROJETS!A:B,2,FALSE),"??"))']);
  }
  sheet.getRange(ligneDebut, colNom, ligneFin - ligneDebut + 1, 1).setFormulas(formulas);
  sheet.getRange(1, colNom).setFontStyle('italic').setNote('Auto — VLOOKUP depuis PROJETS');
}

// ── CONFIG ───────────────────────────────────────────────────────

function creerOngletConfig(ss) {
  var sh = creerOuRecuperer(ss, 'CONFIG');
  sh.clear();

  sh.getRange('A1').setValue('PARAMÈTRES').setFontWeight('bold').setFontSize(12).setFontColor(COULEURS.gold);
  sh.getRange('A3').setValue('Paramètre');
  sh.getRange('B3').setValue('Valeur');
  sh.getRange('A3:B3').setBackground(COULEURS.headerClair).setFontWeight('bold').setFontFamily('DM Mono').setFontSize(10);

  var params = [
    ['objectif_annuel', 800000],
    ['annee_courante', 2026],
    ['associee_1', 'Amélie CHASSERIAUX'],
    ['associee_2', 'Régis LAMBLIN'],
    ['delai_paiement_defaut', 45],
    ['devise', 'EUR'],
  ];
  sh.getRange(4, 1, params.length, 2).setValues(params).setFontFamily('Outfit').setFontSize(10);
  sh.setColumnWidth(1, 220);
  sh.setColumnWidth(2, 250);

  // Listes de référence
  sh.getRange('D1').setValue('LISTES DE RÉFÉRENCE').setFontWeight('bold').setFontSize(12).setFontColor(COULEURS.gold);
  var listHeaders = ['États', 'Phases MOP', 'Types marché', 'Responsables', 'Statuts facture', 'Statuts pipeline', 'Années'];
  var listes = [ETATS, PHASES_MOP, TYPES_MARCHE, RESPONSABLES, STATUTS_FACTURE, STATUTS_PIPELINE, ANNEES];

  for (var l = 0; l < listHeaders.length; l++) {
    sh.getRange(3, 4 + l).setValue(listHeaders[l]);
    for (var i = 0; i < listes[l].length; i++) {
      sh.getRange(4 + i, 4 + l).setValue(listes[l][i]);
    }
  }
  sh.getRange(3, 4, 1, listHeaders.length).setBackground(COULEURS.headerClair).setFontWeight('bold').setFontFamily('DM Mono').setFontSize(10);
  sh.getRange('D4:J20').setFontFamily('Outfit').setFontSize(10);
  for (var c = 4; c <= 10; c++) sh.setColumnWidth(c, 170);

  sh.setTabColor('#8a8f9e');
}

// ── PROJETS ──────────────────────────────────────────────────────

function creerOngletProjets(ss) {
  var sh = creerOuRecuperer(ss, 'PROJETS');
  sh.clear();

  var headers = ['id', 'nom', 'client', 'responsable', 'type_marche', 'phase_courante', 'etat', 'honoraires_ht', 'date_debut', 'date_fin_prevue', 'notes'];
  var largeurs = [160, 280, 200, 120, 130, 130, 160, 130, 110, 120, 300];
  appliquerStyle(sh, headers, largeurs);

  var NB = 100;
  ajouterValidation(sh, 4, RESPONSABLES, 2, NB);
  ajouterValidation(sh, 5, TYPES_MARCHE, 2, NB);
  ajouterValidation(sh, 6, PHASES_MOP, 2, NB);
  ajouterValidation(sh, 7, ETATS, 2, NB);
  fmtNombre(sh, 8, 2, NB);
  fmtDate(sh, 9, 2, NB);
  fmtDate(sh, 10, 2, NB);

  var rules = [
    SpreadsheetApp.newConditionalFormatRule().whenTextContains('Gelé').setBackground('#fce4e4').setFontColor('#c0392b').setRanges([sh.getRange(2, 7, NB, 1)]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextContains('Arrêté').setBackground('#fce4e4').setFontColor('#c0392b').setRanges([sh.getRange(2, 7, NB, 1)]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextContains('En cours').setBackground('#e8f5e9').setFontColor('#2e7d32').setRanges([sh.getRange(2, 7, NB, 1)]).build(),
  ];
  sh.setConditionalFormatRules(rules);
  sh.setTabColor(COULEURS.gold);
}

// ── PHASES ───────────────────────────────────────────────────────

function creerOngletPhases(ss) {
  var sh = creerOuRecuperer(ss, 'PHASES');
  sh.clear();

  var headers = ['projet_id', 'projet_nom', 'phase', 'montant_phase', 'date_debut_prevue', 'date_fin_prevue', 'date_debut_reelle', 'date_fin_reelle', 'avancement', 'livrable'];
  var largeurs = [160, 250, 80, 120, 130, 130, 130, 130, 100, 250];
  appliquerStyle(sh, headers, largeurs);

  var NB = 500;
  ajouterValidation(sh, 3, PHASES_MOP, 2, NB);
  ajouterVlookupNom(sh, 2, 1, 2, 100);
  fmtNombre(sh, 4, 2, NB);
  fmtDate(sh, 5, 2, NB);
  fmtDate(sh, 6, 2, NB);
  fmtDate(sh, 7, 2, NB);
  fmtDate(sh, 8, 2, NB);
  fmtPourcent(sh, 9, 2, NB);

  sh.setTabColor('#5b8dee');
}

// ── PREVISIONNEL (feuille unique, toutes années) ─────────────────

function creerOngletPrevisionnel(ss) {
  var sh = creerOuRecuperer(ss, 'PREVISIONNEL');
  sh.clear();

  // Colonnes : année | projet_id | projet_nom | Jan..Déc | Total
  var headers = ['annee', 'projet_id', 'projet_nom'];
  for (var m = 0; m < MOIS.length; m++) headers.push(MOIS[m]);
  headers.push('Total');

  var largeurs = [70, 160, 250];
  for (var m = 0; m < 12; m++) largeurs.push(85);
  largeurs.push(100);

  appliquerStyle(sh, headers, largeurs);

  // Figer aussi la colonne année + id + nom
  sh.setFrozenColumns(3);

  var NB = 300; // ~100 projets x 3 ans

  // Validation année (liste déroulante depuis CONFIG col J)
  var anneesList = [];
  for (var a = 0; a < ANNEES.length; a++) anneesList.push(String(ANNEES[a]));
  ajouterValidation(sh, 1, anneesList, 2, NB);

  // projet_nom = VLOOKUP sur col B (projet_id)
  ajouterVlookupNom(sh, 3, 2, 2, NB);

  // Total = SUM(D:O) — colonnes 4 à 15
  for (var r = 2; r <= NB; r++) {
    sh.getRange(r, 16).setFormula('=IF(B' + r + '="","",SUM(D' + r + ':O' + r + '))');
  }

  // Format nombres colonnes mois + total
  for (var c = 4; c <= 16; c++) {
    fmtNombre(sh, c, 2, NB);
  }

  // Mise en forme conditionnelle
  var rules = [
    SpreadsheetApp.newConditionalFormatRule()
      .whenNumberGreaterThan(0)
      .setBackground('#e8f5e9')
      .setRanges([sh.getRange(2, 4, NB, 12)])
      .build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenNumberEqualTo(0)
      .setFontColor('#d0cdc6')
      .setRanges([sh.getRange(2, 4, NB, 12)])
      .build(),
  ];
  sh.setConditionalFormatRules(rules);

  // Créer le filtre natif Google Sheets sur toute la plage
  var filterRange = sh.getRange(1, 1, NB, 16);
  sh.getFilter() || filterRange.createFilter();

  sh.setTabColor(COULEURS.gold);
}

// ── ECHEANCIER ───────────────────────────────────────────────────

function creerOngletEcheancier(ss) {
  var sh = creerOuRecuperer(ss, 'ECHEANCIER');
  sh.clear();

  var headers = ['projet_id', 'projet_nom', 'phase', 'montant_ht', 'date_facture_prevue', 'delai_paiement_jours', 'date_encaissement_prevue', 'conditions'];
  var largeurs = [160, 250, 80, 120, 140, 140, 160, 300];
  appliquerStyle(sh, headers, largeurs);

  var NB = 200;
  ajouterVlookupNom(sh, 2, 1, 2, NB);

  for (var r = 2; r <= NB; r++) {
    sh.getRange(r, 7).setFormula('=IF(E' + r + '="","",E' + r + '+F' + r + ')');
  }

  ajouterValidation(sh, 3, PHASES_MOP, 2, NB);
  fmtNombre(sh, 4, 2, NB);
  fmtDate(sh, 5, 2, NB);
  fmtDate(sh, 7, 2, NB);

  sh.getRange(1, 6).setNote('Par défaut : 45 jours (marchés publics). Modifier par ligne si besoin.');
  sh.getRange(1, 7).setFontStyle('italic').setNote('Auto — date_facture + délai');

  sh.setTabColor('#e08c3a');
}

// ── FACTURES ─────────────────────────────────────────────────────

function creerOngletFactures(ss) {
  var sh = creerOuRecuperer(ss, 'FACTURES');
  sh.clear();

  var headers = ['projet_id', 'projet_nom', 'numero', 'date_emission', 'montant_ht', 'date_echeance', 'date_encaissement', 'statut'];
  var largeurs = [160, 250, 130, 120, 120, 120, 140, 120];
  appliquerStyle(sh, headers, largeurs);

  var NB = 500;
  ajouterVlookupNom(sh, 2, 1, 2, NB);
  ajouterValidation(sh, 8, STATUTS_FACTURE, 2, NB);
  fmtNombre(sh, 5, 2, NB);
  fmtDate(sh, 4, 2, NB);
  fmtDate(sh, 6, 2, NB);
  fmtDate(sh, 7, 2, NB);

  var rules = [
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Payée').setBackground('#e8f5e9').setFontColor('#2e7d32').setRanges([sh.getRange(2, 8, NB, 1)]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Relancée').setBackground('#fff3e0').setFontColor('#e65100').setRanges([sh.getRange(2, 8, NB, 1)]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('En litige').setBackground('#fce4e4').setFontColor('#c0392b').setRanges([sh.getRange(2, 8, NB, 1)]).build(),
  ];
  sh.setConditionalFormatRules(rules);

  // Filtre natif
  sh.getRange(1, 1, NB, 8).createFilter();

  sh.setTabColor(COULEURS.green);
}

// ── PIPELINE ─────────────────────────────────────────────────────

function creerOngletPipeline(ss) {
  var sh = creerOuRecuperer(ss, 'PIPELINE');
  sh.clear();

  var headers = ['nom', 'client', 'montant_estime', 'probabilite', 'montant_pondere', 'date_reponse', 'responsable', 'statut', 'notes'];
  var largeurs = [280, 200, 130, 100, 130, 120, 120, 120, 300];
  appliquerStyle(sh, headers, largeurs);

  var NB = 100;
  ajouterValidation(sh, 4, PROBABILITES, 2, NB);
  ajouterValidation(sh, 7, RESPONSABLES, 2, NB);
  ajouterValidation(sh, 8, STATUTS_PIPELINE, 2, NB);
  fmtNombre(sh, 3, 2, NB);
  fmtNombre(sh, 5, 2, NB);
  fmtDate(sh, 6, 2, NB);

  for (var r = 2; r <= NB; r++) {
    sh.getRange(r, 5).setFormula('=IF(C' + r + '="","",C' + r + '*SUBSTITUTE(D' + r + ',"%","")/100)');
  }
  sh.getRange(1, 5).setFontStyle('italic').setNote('Auto — montant x probabilité');

  var rules = [
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Gagné').setBackground('#e8f5e9').setFontColor('#2e7d32').setRanges([sh.getRange(2, 8, NB, 1)]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Perdu').setBackground('#fce4e4').setFontColor('#c0392b').setRanges([sh.getRange(2, 8, NB, 1)]).build(),
  ];
  sh.setConditionalFormatRules(rules);

  sh.setTabColor('#9b59b6');
}

// ── CONTACTS ─────────────────────────────────────────────────────

function creerOngletContacts(ss) {
  var sh = creerOuRecuperer(ss, 'CONTACTS');
  sh.clear();

  var headers = ['projet_id', 'projet_nom', 'nom', 'role', 'email', 'telephone', 'organisation', 'notes'];
  var largeurs = [160, 250, 180, 180, 220, 140, 200, 300];
  appliquerStyle(sh, headers, largeurs);

  ajouterVlookupNom(sh, 2, 1, 2, 300);
  sh.setTabColor('#5b8dee');
}

// ── CHARGES ──────────────────────────────────────────────────────

function creerOngletCharges(ss) {
  var sh = creerOuRecuperer(ss, 'CHARGES');
  sh.clear();

  var headers = ['projet_id', 'projet_nom', 'mois', 'amelie_jours', 'regis_jours', 'total_jours', 'notes'];
  var largeurs = [160, 250, 100, 120, 120, 120, 300];
  appliquerStyle(sh, headers, largeurs);

  var NB = 500;
  ajouterVlookupNom(sh, 2, 1, 2, NB);

  for (var r = 2; r <= NB; r++) {
    sh.getRange(r, 6).setFormula('=IF(A' + r + '="","",D' + r + '+E' + r + ')');
  }
  sh.getRange(1, 6).setFontStyle('italic').setNote('Auto — amélie + régis');

  fmtDate(sh, 3, 2, NB);
  sh.getRange(2, 4, NB, 3).setNumberFormat('0.0');

  sh.setTabColor('#8a8f9e');
}


// ═══════════════════════════════════════════════════════════════
// API — Point d'accès pour le Cockpit Next.js
// Déployer : Déployer > Nouveau déploiement > Application Web
//   Exécuter en tant que : Moi
//   Accès : Tout le monde
// ═══════════════════════════════════════════════════════════════

function doGet(e) {
  var params = (e && e.parameter) ? e.parameter : {};
  var action = params.action || 'all';
  var annee = params.annee ? Number(params.annee) : null;

  var result;
  switch (action) {
    case 'projets':      result = getProjets(); break;
    case 'previsionnel': result = getPrevisionnel(annee); break;
    case 'factures':     result = getFactures(); break;
    case 'pipeline':     result = getPipeline(); break;
    case 'config':       result = getConfig(); break;
    case 'phases':       result = getPhases(); break;
    case 'echeancier':   result = getEcheancier(); break;
    case 'contacts':     result = getContacts(); break;
    case 'charges':      result = getCharges(); break;
    case 'all':
    default:
      result = {
        projets: getProjets(),
        previsionnel: getPrevisionnel(annee),
        factures: getFactures(),
        pipeline: getPipeline(),
        config: getConfig(),
        stats: getStats(annee),
      };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── LECTURE GÉNÉRIQUE ────────────────────────────────────────────

function sheetToObjects(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(sheetName);
  if (!sh) return [];

  var data = sh.getDataRange().getValues();
  if (data.length < 2) return [];

  var headers = data[0];
  var rows = [];
  for (var r = 1; r < data.length; r++) {
    if (data[r][0] === '' || data[r][0] === null) continue;
    var obj = {};
    for (var c = 0; c < headers.length; c++) {
      var key = String(headers[c]).trim();
      var val = data[r][c];
      if (val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      }
      obj[key] = val;
    }
    rows.push(obj);
  }
  return rows;
}

function getProjets()    { return sheetToObjects('PROJETS'); }
function getFactures()   { return sheetToObjects('FACTURES'); }
function getPipeline()   { return sheetToObjects('PIPELINE'); }
function getPhases()     { return sheetToObjects('PHASES'); }
function getEcheancier() { return sheetToObjects('ECHEANCIER'); }
function getContacts()   { return sheetToObjects('CONTACTS'); }
function getCharges()    { return sheetToObjects('CHARGES'); }

// ── PREVISIONNEL (filtré par année) ──────────────────────────────

function getPrevisionnel(annee) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('PREVISIONNEL');
  if (!sh) return {};

  var data = sh.getDataRange().getValues();
  if (data.length < 2) return {};

  var config = getConfig();
  var anneeCourante = Number(config.annee_courante) || 2026;

  // Collecter toutes les années présentes
  var anneesPresentes = {};
  for (var r = 1; r < data.length; r++) {
    var a = Number(data[r][0]);
    if (a > 0) anneesPresentes[a] = true;
  }

  // Si une année est demandée, ne renvoyer que celle-là
  // Sinon renvoyer toutes les années
  var anneesATraiter = annee ? [annee] : Object.keys(anneesPresentes).map(Number).sort();

  var moisLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  var resultat = {};

  for (var ai = 0; ai < anneesATraiter.length; ai++) {
    var an = anneesATraiter[ai];
    var projets = [];
    var totaux = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    for (var r = 1; r < data.length; r++) {
      if (Number(data[r][0]) !== an) continue;
      var id = data[r][1];
      if (!id || id === '') continue;

      var mois = [];
      for (var m = 0; m < 12; m++) {
        var v = Number(data[r][3 + m]) || 0;
        mois.push(v);
        totaux[m] += v;
      }
      projets.push({
        id: id,
        nom: data[r][2],
        mois: mois,
        total: Number(data[r][15]) || 0,
      });
    }

    var totaux_mois = [];
    for (var m = 0; m < 12; m++) {
      totaux_mois.push({ mois: moisLabels[m], montant: totaux[m] });
    }

    resultat[an] = {
      annee: an,
      projets: projets,
      totaux_mois: totaux_mois,
      total_annuel: totaux.reduce(function(a, b) { return a + b; }, 0),
    };
  }

  // Si une seule année demandée, retourner directement l'objet
  if (annee && resultat[annee]) return resultat[annee];
  return resultat;
}

// ── CONFIG ───────────────────────────────────────────────────────

function getConfig() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('CONFIG');
  if (!sh) return {};

  var data = sh.getRange('A4:B10').getValues();
  var config = {};
  for (var r = 0; r < data.length; r++) {
    if (data[r][0]) config[String(data[r][0]).trim()] = data[r][1];
  }
  return config;
}

// ── STATS (avec comparaison N-1) ─────────────────────────────────

function getStats(annee) {
  var config = getConfig();
  var anneeCourante = annee || Number(config.annee_courante) || 2026;
  var projets = getProjets();

  var allPrev = getPrevisionnel(null); // toutes les années
  var prevCourante = allPrev[anneeCourante] || { projets: [], totaux_mois: [], total_annuel: 0 };
  var prevN1 = allPrev[anneeCourante - 1] || null;

  var totalReste = 0;
  for (var i = 0; i < projets.length; i++) {
    totalReste += Number(projets[i].honoraires_ht) || 0;
  }

  var objectif = Number(config.objectif_annuel) || 800000;

  var stats = {
    nb_projets_actifs: projets.length,
    total_reste_facturer: totalReste,
    annee_courante: anneeCourante,
    total_prevu: prevCourante.total_annuel || 0,
    objectif_annuel: objectif,
    objectif_mensuel: Math.round(objectif / 12),
    totaux_mois: prevCourante.totaux_mois || [],
  };

  // Comparaison N-1
  if (prevN1) {
    stats.total_prevu_n1 = prevN1.total_annuel || 0;
    stats.totaux_mois_n1 = prevN1.totaux_mois || [];
    stats.evolution_pct = stats.total_prevu_n1 > 0
      ? Math.round((stats.total_prevu - stats.total_prevu_n1) / stats.total_prevu_n1 * 100)
      : null;
  }

  // Années disponibles
  stats.annees_disponibles = Object.keys(allPrev).map(Number).sort();

  return stats;
}
