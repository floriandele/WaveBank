/**
 * monthEndBalance.js
 * Utilitaire calculant la projection du solde jusqu'à la fin du mois en cours,
 * et identifiant le solde minimum ainsi que les transactions contributives.
 */

/**
 * Retourne le dernier jour du mois pour une date donnée (string YYYY-MM-DD).
 * @param {string} dateStr
 * @returns {Date}
 */
function getLastDayOfMonth(dateStr) {
  const d = new Date(dateStr)
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

/**
 * Formate une Date en string YYYY-MM-DD (en UTC-safe, sans décalage TZ).
 * @param {Date} date
 * @returns {string}
 */
function toDateString(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Calcule la projection du solde de fin de mois pour un compte donné.
 *
 * @param {Object} account            - Objet compte { id, balance, currency, … }
 * @param {Array}  allTransactions    - Toutes les transactions de l'application
 * @param {string} [today]            - Date du jour (YYYY-MM-DD), défaut = date réelle
 * @returns {{
 *   forecastPoints:            Array<{date: string, balance: number}>,
 *   monthEndBalance:           number,
 *   monthEndDate:              string,
 *   minBalance:                number,
 *   minBalanceDate:            string,
 *   isNegative:                boolean,
 *   contributingTransactions:  Array,
 *   today:                     string,
 * }}
 */
export function computeMonthEndProjection(account, allTransactions, today) {
  const todayStr = today ?? toDateString(new Date())
  const todayDate = new Date(todayStr)
  const monthEnd = getLastDayOfMonth(todayStr)
  const monthEndStr = toDateString(monthEnd)

  // Premier jour du mois courant (pour filtrer les transactions contributives à afficher)
  const monthStart = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1)

  // Transactions du compte pour le mois courant et la période future jusqu'à fin de mois
  const accountMonthTransactions = allTransactions
    .filter((t) => t.accountId === account.id)
    .filter((t) => {
      const d = new Date(t.date)
      return d >= monthStart && d <= monthEnd
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  // Transactions strictement futures (après aujourd'hui) pour construire la projection
  const futureTransactions = accountMonthTransactions.filter(
    (t) => new Date(t.date) > todayDate,
  )

  // Construction des points jour par jour de aujourd'hui à fin de mois
  const forecastPoints = []
  let runningBalance = account.balance

  const cursor = new Date(todayDate)
  while (cursor <= monthEnd) {
    const dateStr = toDateString(cursor)

    // Appliquer les transactions futures de ce jour
    futureTransactions
      .filter((t) => t.date === dateStr)
      .forEach((t) => {
        runningBalance += t.amount
      })

    forecastPoints.push({ date: dateStr, balance: runningBalance })
    cursor.setDate(cursor.getDate() + 1)
  }

  // Solde minimum projeté
  const minPoint = forecastPoints.reduce(
    (min, p) => (p.balance < min.balance ? p : min),
    forecastPoints[0] ?? { date: todayStr, balance: account.balance },
  )

  // Solde en fin de mois (dernier point)
  const lastPoint = forecastPoints[forecastPoints.length - 1]
  const monthEndBalance = lastPoint?.balance ?? account.balance

  // Y a-t-il un moment où le solde passe en négatif ?
  const isNegative = forecastPoints.some((p) => p.balance < 0)

  // Transactions à afficher : du mois courant, triées par date décroissante, max 5
  const contributingTransactions = [...accountMonthTransactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  return {
    forecastPoints,
    monthEndBalance,
    monthEndDate: monthEndStr,
    minBalance: minPoint.balance,
    minBalanceDate: minPoint.date,
    isNegative,
    contributingTransactions,
    today: todayStr,
  }
}
