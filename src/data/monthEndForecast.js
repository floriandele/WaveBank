// Projection de trésorerie pour le mois en cours (novembre 2026),
// jour par jour du 1er au 30 novembre.
// Les entrées marquées isProjected: false sont les soldes déjà constatés ;
// isProjected: true indique une prévision calculée à partir des échéances connues.
// Le flag isMonthEndForecast permet de distinguer ce jeu de données des
// données historiques de cashflow.js.

export const isMonthEndForecast = true

// Solde EUR consolidé (comptes courant + épargne) jour par jour
export const monthEndForecast = [
  { date: '2026-11-01', balance: 67000, isProjected: false },
  { date: '2026-11-02', balance: 58600, isProjected: false },
  { date: '2026-11-03', balance: 58200, isProjected: false },
  { date: '2026-11-04', balance: 58000, isProjected: true },
  { date: '2026-11-05', balance: 55360, isProjected: true },
  { date: '2026-11-06', balance: 55140, isProjected: true },
  { date: '2026-11-07', balance: 54920, isProjected: true },
  { date: '2026-11-08', balance: 54700, isProjected: true },
  { date: '2026-11-09', balance: 54480, isProjected: true },
  { date: '2026-11-10', balance: 57480, isProjected: true },
  { date: '2026-11-11', balance: 57260, isProjected: true },
  { date: '2026-11-12', balance: 57040, isProjected: true },
  { date: '2026-11-13', balance: 56820, isProjected: true },
  { date: '2026-11-14', balance: 56600, isProjected: true },
  { date: '2026-11-15', balance: 55400, isProjected: true },
  { date: '2026-11-16', balance: 55180, isProjected: true },
  { date: '2026-11-17', balance: 54960, isProjected: true },
  { date: '2026-11-18', balance: 54740, isProjected: true },
  { date: '2026-11-19', balance: 54520, isProjected: true },
  { date: '2026-11-20', balance: 52670, isProjected: true },
  { date: '2026-11-21', balance: 52450, isProjected: true },
  { date: '2026-11-22', balance: 52230, isProjected: true },
  { date: '2026-11-23', balance: 52010, isProjected: true },
  { date: '2026-11-24', balance: 51790, isProjected: true },
  { date: '2026-11-25', balance: 53570, isProjected: true },
  { date: '2026-11-26', balance: 53350, isProjected: true },
  { date: '2026-11-27', balance: 53130, isProjected: true },
  { date: '2026-11-28', balance: 50790, isProjected: true },
  { date: '2026-11-29', balance: 50570, isProjected: true },
  { date: '2026-11-30', balance: 50350, isProjected: true },
]

// Transactions planifiées du mois courant (EUR uniquement)
// utilisées pour identifier les principales dépenses de la période.
export const projectedTransactions = [
  { date: '2026-11-02', label: 'Salaires équipe — novembre', amount: -8400, category: 'Salaires', accountId: 'courant' },
  { date: '2026-11-05', label: 'Virement fournisseur — Matexbois', amount: -2640, category: 'Fournisseurs', accountId: 'courant' },
  { date: '2026-11-10', label: 'Encaissement client — Menuiserie Lefèvre', amount: 3000, category: 'Encaissement client', accountId: 'courant' },
  { date: '2026-11-15', label: 'Loyer bureau — novembre', amount: -1200, category: 'Loyer', accountId: 'courant' },
  { date: '2026-11-20', label: 'Prélèvement URSSAF', amount: -1850, category: 'Charges sociales', accountId: 'courant' },
  { date: '2026-11-25', label: 'Virement client — Ateliers Rocher', amount: 1780, category: 'Encaissement client', accountId: 'courant' },
  { date: '2026-11-28', label: 'Virement fournisseur — Leroy Pro', amount: -2340, category: 'Fournisseurs', accountId: 'courant' },
]
