/**
 * Données mock des candidatures / demandes de prêt.
 * Statuts possibles : en_cours, approuvee, rejetee
 */
export const loanApplications = [
  {
    id: 'app-2025-001',
    loanType: 'Équipement',
    principal: 30000,
    annualRate: 5.5,
    durationMonths: 48,
    submittedDate: '2025-10-12',
    status: 'approuvee',
    notes: 'Dossier validé par le conseiller.',
  },
  {
    id: 'app-2025-002',
    loanType: 'Trésorerie',
    principal: 8000,
    annualRate: 7.0,
    durationMonths: 24,
    submittedDate: '2025-11-03',
    status: 'rejetee',
    notes: 'Capacité de remboursement insuffisante.',
  },
]

/**
 * Crée une nouvelle candidature en statut "En cours".
 * (Dans une vraie app, cela serait un POST API. Ici on retourne l'objet.)
 * @param {object} params
 * @returns {object}
 */
export function createApplication({ loanType = 'Autre', principal, annualRate, durationMonths }) {
  const id = `app-${Date.now()}`
  return {
    id,
    loanType,
    principal,
    annualRate,
    durationMonths,
    submittedDate: new Date().toISOString().slice(0, 10),
    status: 'en_cours',
    notes: '',
  }
}
