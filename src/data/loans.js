/**
 * Données simulées des crédits actifs (mock data).
 */
export const loans = [
  {
    id: 'loan-001',
    label: 'Crédit équipement atelier',
    amount: 45000,
    annualRate: 0.06,
    months: 60,
    startDate: '2023-01-15',
    status: 'approuvée',
    description: 'Financement machines CNC et équipements de découpe',
  },
  {
    id: 'loan-002',
    label: 'Crédit trésorerie court terme',
    amount: 8500,
    annualRate: 0.08,
    months: 24,
    startDate: '2024-06-01',
    status: 'approuvée',
    description: 'Apport en trésorerie pour faire face aux délais de paiement clients',
  },
  {
    id: 'loan-003',
    label: 'Crédit développement commercial',
    amount: 75000,
    annualRate: 0.045,
    months: 84,
    startDate: '2022-09-10',
    status: 'approuvée',
    description: 'Financement d\'une nouvelle ligne de production et recrutement',
  },
]
