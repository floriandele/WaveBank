/**
 * Données mock des prêts actifs du client.
 * Taux de base : 5,5 % — variations ±1,5 % selon profil fictif.
 */
export const loans = [
  {
    id: 'pret-immo-01',
    number: 'PRT-2022-0041',
    name: 'Prêt immobilier professionnel',
    type: 'Immobilier',
    principal: 180000,
    annualRate: 4.0,
    durationMonths: 240,
    startDate: '2022-03-15',
    status: 'actif',
    color: '#2F5DFB',
  },
  {
    id: 'pret-materiel-02',
    number: 'PRT-2023-0118',
    name: 'Prêt équipement machine-outil',
    type: 'Équipement',
    principal: 45000,
    annualRate: 5.5,
    durationMonths: 60,
    startDate: '2023-09-01',
    status: 'actif',
    color: '#0E7490',
  },
  {
    id: 'pret-tresorerie-03',
    number: 'PRT-2024-0257',
    name: 'Prêt de trésorerie',
    type: 'Trésorerie',
    principal: 20000,
    annualRate: 7.0,
    durationMonths: 36,
    startDate: '2024-01-10',
    status: 'actif',
    color: '#7C3AED',
  },
]

/**
 * Taux indicatifs selon durée et profil.
 */
export const indicativeRates = [
  { durationLabel: '12 mois', months: 12, rate: 4.0 },
  { durationLabel: '24 mois', months: 24, rate: 4.5 },
  { durationLabel: '36 mois', months: 36, rate: 5.0 },
  { durationLabel: '48 mois', months: 48, rate: 5.5 },
  { durationLabel: '60 mois', months: 60, rate: 5.5 },
  { durationLabel: '120 mois', months: 120, rate: 6.0 },
  { durationLabel: '240 mois', months: 240, rate: 6.5 },
  { durationLabel: '360 mois', months: 360, rate: 7.0 },
]

/**
 * Retourne le taux indicatif le plus proche d'une durée donnée.
 * @param {number} months
 * @returns {number}
 */
export function getIndicativeRate(months) {
  if (!months || months <= 0) return 5.5
  const sorted = [...indicativeRates].sort(
    (a, b) => Math.abs(a.months - months) - Math.abs(b.months - months),
  )
  return sorted[0].rate
}
