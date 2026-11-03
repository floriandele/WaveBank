/**
 * Données simulées des demandes de crédit (mock data).
 */
export const loanApplications = [
  {
    id: 'app-001',
    label: 'Demande crédit véhicule utilitaire',
    amount: 22000,
    annualRate: 0.06,
    months: 48,
    requestDate: '2025-10-15',
    status: 'en_attente',
    description: 'Achat d\'un véhicule utilitaire pour livraisons',
  },
  {
    id: 'app-002',
    label: 'Demande crédit immobilier pro',
    amount: 350000,
    annualRate: 0.045,
    months: 240,
    requestDate: '2025-09-03',
    status: 'refusée',
    description: 'Acquisition de locaux professionnels',
  },
  {
    id: 'app-003',
    label: 'Demande crédit matériel informatique',
    amount: 4500,
    annualRate: 0.08,
    months: 12,
    requestDate: '2025-11-01',
    status: 'annulée',
    description: 'Renouvellement du parc informatique',
  },
]
