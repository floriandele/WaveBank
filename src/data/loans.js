import { calculateSchedule } from '../utils/loanCalculations'

const schedule1 = calculateSchedule(15000, 0.038, 48, '2024-01-15')
const schedule2 = calculateSchedule(7500, 0.045, 24, '2025-06-01')
const schedule3 = calculateSchedule(30000, 0.032, 84, '2025-09-01')

// Solde restant pour le prêt en_cours (prêt 1, commencé jan 2024, 22 mensualités écoulées)
const elapsed1 = 22
const remainingBalance1 = schedule1[elapsed1 - 1]?.remainingBalance ?? 15000

// Prêt en_cours commencé en juin 2025, 5 mensualités écoulées
const elapsed2 = 5
const remainingBalance2 = schedule2[elapsed2 - 1]?.remainingBalance ?? 7500

export let loans = [
  {
    id: 'loan-001',
    amount: 15000,
    duration: 48,
    rate: 0.038,
    monthlyPayment: Math.round(schedule1[0].payment * 100) / 100,
    totalCost: Math.round(schedule1[0].payment * 48 * 100) / 100,
    status: 'en_cours',
    appliedDate: '2024-01-10',
    loanStartDate: '2024-02-01',
    remainingBalance: remainingBalance1,
    remainingMonths: 48 - elapsed1,
    nextPaymentDate: '2025-12-01',
    schedule: schedule1,
  },
  {
    id: 'loan-002',
    amount: 7500,
    duration: 24,
    rate: 0.045,
    monthlyPayment: Math.round(schedule2[0].payment * 100) / 100,
    totalCost: Math.round(schedule2[0].payment * 24 * 100) / 100,
    status: 'en_cours',
    appliedDate: '2025-05-20',
    loanStartDate: '2025-06-01',
    remainingBalance: remainingBalance2,
    remainingMonths: 24 - elapsed2,
    nextPaymentDate: '2025-12-01',
    schedule: schedule2,
  },
  {
    id: 'loan-003',
    amount: 30000,
    duration: 84,
    rate: 0.032,
    monthlyPayment: Math.round(schedule3[0].payment * 100) / 100,
    totalCost: Math.round(schedule3[0].payment * 84 * 100) / 100,
    status: 'accepte',
    appliedDate: '2025-08-15',
    loanStartDate: '2025-09-01',
    remainingBalance: 30000,
    remainingMonths: 84,
    nextPaymentDate: '2025-10-01',
    schedule: schedule3,
  },
  {
    id: 'loan-004',
    amount: 5000,
    duration: 12,
    rate: 0.045,
    monthlyPayment: null,
    totalCost: null,
    status: 'en_demande',
    appliedDate: '2026-10-28',
    loanStartDate: null,
    remainingBalance: 5000,
    remainingMonths: 12,
    nextPaymentDate: null,
    schedule: [],
  },
]

export function addLoan(loan) {
  loans = [...loans, loan]
  return loan
}
