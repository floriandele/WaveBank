/**
 * Utilitaires de projection de fin de mois.
 * Calcule le solde minimum, détecte les découverts et extrait
 * les principales dépenses du mois en cours.
 */

const NEAR_ZERO_THRESHOLD = 1000

/**
 * Retourne le dernier jour du mois d'une date donnée (YYYY-MM-DD).
 * @param {string} dateStr
 * @returns {string} date ISO YYYY-MM-DD
 */
export function getLastDayOfMonth(dateStr) {
  const d = new Date(dateStr)
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return lastDay.toISOString().slice(0, 10)
}

/**
 * Filtre les entrées de prévision pour ne garder que celles
 * comprises entre aujourd'hui et la fin du mois courant.
 * Les entrées sans date valide ou hors du mois courant sont ignorées.
 *
 * @param {Array<{date: string, balance: number}>} forecastData
 * @param {string} [todayStr] - date de référence ISO (default: new Date())
 * @returns {Array<{date: string, balance: number}>}
 */
export function filterCurrentMonth(forecastData, todayStr) {
  const today = todayStr ? new Date(todayStr) : new Date()
  const todayISO = today.toISOString().slice(0, 10)
  const lastDay = getLastDayOfMonth(todayISO)

  return forecastData.filter((entry) => {
    if (!entry.date || isNaN(new Date(entry.date).getTime())) return false
    return entry.date >= todayISO && entry.date <= lastDay
  })
}

/**
 * Calcule le solde minimum projeté sur une série de données.
 * Retourne null si la série est vide.
 *
 * @param {Array<{date: string, balance: number}>} forecastData
 * @returns {{ date: string, balance: number } | null}
 */
export function getMinBalance(forecastData) {
  if (!forecastData || forecastData.length === 0) return null
  return forecastData.reduce(
    (min, entry) => (entry.balance < min.balance ? entry : min),
    forecastData[0],
  )
}

/**
 * Détermine si la série de prévision présente un risque de découvert.
 * Retourne true si le solde minimum est négatif OU inférieur au seuil d'alerte.
 *
 * @param {Array<{date: string, balance: number}>} forecastData
 * @param {number} [threshold] - seuil d'alerte (défaut: 1000)
 * @returns {'negative' | 'warning' | null}
 */
export function detectOverdraftRisk(forecastData, threshold = NEAR_ZERO_THRESHOLD) {
  const min = getMinBalance(forecastData)
  if (!min) return null
  if (min.balance < 0) return 'negative'
  if (min.balance < threshold) return 'warning'
  return null
}

/**
 * Extrait les N principales dépenses (montant négatif) du mois courant
 * parmi les transactions fournies, triées par montant absolu décroissant.
 * Enrichit chaque entrée avec un champ cumulativeImpact.
 *
 * @param {Array<{date: string, amount: number, label: string, category: string}>} transactions
 * @param {string} [todayStr] - date de référence ISO
 * @param {number} [n] - nombre de transactions à retourner (3 à 5, défaut: 5)
 * @returns {Array<{date: string, amount: number, label: string, category: string, cumulativeImpact: number}>}
 */
export function getTopExpenses(transactions, todayStr, n = 5) {
  const today = todayStr ? new Date(todayStr) : new Date()
  const year = today.getFullYear()
  const month = today.getMonth() // 0-indexed

  // Filtre : dépenses du mois courant, date valide, montant négatif
  const expenses = transactions.filter((t) => {
    if (!t.date || isNaN(new Date(t.date).getTime())) return false
    const d = new Date(t.date)
    return d.getFullYear() === year && d.getMonth() === month && t.amount < 0
  })

  // Trier par montant absolu décroissant
  const sorted = [...expenses].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
  const top = sorted.slice(0, Math.min(n, sorted.length))

  // Calcul de l'impact cumulatif (somme croissante des montants négatifs)
  let cumulative = 0
  return top.map((t) => {
    cumulative += t.amount
    return { ...t, cumulativeImpact: cumulative }
  })
}

/**
 * Calcule le total des dépenses du mois courant.
 *
 * @param {Array<{date: string, amount: number}>} transactions
 * @param {string} [todayStr]
 * @returns {number}
 */
export function getTotalExpenses(transactions, todayStr) {
  const today = todayStr ? new Date(todayStr) : new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  return transactions
    .filter((t) => {
      if (!t.date || isNaN(new Date(t.date).getTime())) return false
      const d = new Date(t.date)
      return d.getFullYear() === year && d.getMonth() === month && t.amount < 0
    })
    .reduce((sum, t) => sum + t.amount, 0)
}
