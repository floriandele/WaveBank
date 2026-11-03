import { generateSchedule } from '../utils/loanCalculations'

// Prêt 1 : Prêt équipement 50 000 EUR sur 60 mois à 4.5%
// Démarré il y a 14 mois (décembre 2025 → remboursements depuis jan 2026)
const loan1Schedule = generateSchedule(50000, 4.5, 60, '2025-12-01')

// Prêt 2 : Prêt trésorerie 25 000 EUR sur 36 mois à 5.2%
// Démarré il y a 8 mois (février 2026)
const loan2Schedule = generateSchedule(25000, 5.2, 36, '2026-02-01')

// Prêt 3 (en attente) : demande en cours, pas encore de schedule
// Prêt 4 (rejeté) : conservé dans l'historique uniquement

export const loans = [
  {
    id: 'pret-001',
    type: 'Prêt équipement',
    label: 'Machines CNC & équipements atelier',
    amount: 50000,
    rate: 4.5,
    term: 60,
    monthlyPayment: 931.51,
    status: 'en_cours',
    createdDate: '2025-11-20',
    startDate: '2025-12-01',
    nextPaymentDate: '2026-12-01',
    schedule: loan1Schedule,
  },
  {
    id: 'pret-002',
    type: 'Prêt trésorerie',
    label: 'Renforcement fonds de roulement',
    amount: 25000,
    rate: 5.2,
    term: 36,
    monthlyPayment: 750.79,
    status: 'en_cours',
    createdDate: '2026-01-15',
    startDate: '2026-02-01',
    nextPaymentDate: '2026-12-01',
    schedule: loan2Schedule,
  },
  {
    id: 'pret-003',
    type: 'Prêt immobilier professionnel',
    label: 'Extension des locaux',
    amount: 120000,
    rate: 3.9,
    term: 120,
    monthlyPayment: null,
    status: 'en_attente',
    createdDate: '2026-10-28',
    startDate: null,
    nextPaymentDate: null,
    schedule: [],
  },
  {
    id: 'pret-004',
    type: 'Prêt véhicule',
    label: 'Camionnette de livraison',
    amount: 18000,
    rate: 6.1,
    term: 48,
    monthlyPayment: null,
    status: 'rejeté',
    createdDate: '2026-07-05',
    startDate: null,
    nextPaymentDate: null,
    schedule: [],
  },
]

// Historique de remboursements anticipés enregistrés
export const earlyRepayments = [
  {
    id: 'rpa-001',
    loanId: 'pret-002',
    date: '2026-09-15',
    amount: 3000,
    newBalance: null, // recalculé à la volée
    note: 'Remboursement partiel anticipé',
  },
]
