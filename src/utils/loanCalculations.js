/**
 * Calcule la mensualité d'un prêt.
 * Formule : M = P × r(1+r)^n / ((1+r)^n - 1)
 * @param {number} principal - Montant du prêt (€)
 * @param {number} annualRate - Taux annuel en % (ex: 5.5 pour 5.5 %)
 * @param {number} months - Durée en mois
 * @returns {number} Mensualité en €
 */
export function calculateMonthlyPayment(principal, annualRate, months) {
  if (!principal || principal <= 0 || !months || months <= 0) return 0
  const r = annualRate / 100 / 12
  if (r === 0) return principal / months
  const factor = Math.pow(1 + r, months)
  return (principal * r * factor) / (factor - 1)
}

/**
 * Calcule le coût total du prêt (capital + intérêts).
 */
export function calculateTotalCost(principal, annualRate, months) {
  const monthly = calculateMonthlyPayment(principal, annualRate, months)
  return monthly * months
}

/**
 * Calcule le total des intérêts payés sur la durée du prêt.
 */
export function calculateTotalInterest(principal, annualRate, months) {
  return calculateTotalCost(principal, annualRate, months) - principal
}

/**
 * Génère le calendrier d'amortissement complet.
 * @param {number} principal
 * @param {number} annualRate
 * @param {number} months
 * @param {string} startDate - ISO date string (ex: "2023-06-01")
 * @returns {Array<{month, date, payment, capital, interest, balance}>}
 */
export function generateAmortizationSchedule(principal, annualRate, months, startDate) {
  const r = annualRate / 100 / 12
  const monthly = calculateMonthlyPayment(principal, annualRate, months)
  const schedule = []
  let balance = principal
  const start = new Date(startDate)

  for (let i = 1; i <= months; i++) {
    const interest = r === 0 ? 0 : balance * r
    const capital = monthly - interest
    balance = Math.max(0, balance - capital)

    const date = new Date(start)
    date.setMonth(date.getMonth() + i)

    schedule.push({
      month: i,
      date: date.toISOString().slice(0, 10),
      payment: monthly,
      capital,
      interest,
      balance,
    })
  }

  return schedule
}

/**
 * Calcule le solde restant d'un prêt à la date d'aujourd'hui.
 */
export function calculateRemainingBalance(principal, annualRate, durationMonths, startDate) {
  const today = new Date()
  const start = new Date(startDate)

  const monthsPassed = Math.max(
    0,
    (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth()),
  )

  if (monthsPassed <= 0) return principal
  if (monthsPassed >= durationMonths) return 0

  const schedule = generateAmortizationSchedule(principal, annualRate, durationMonths, startDate)
  return schedule[monthsPassed - 1]?.balance ?? 0
}

/**
 * Calcule le nombre de mensualités restantes à partir d'aujourd'hui.
 */
export function calculateRemainingMonths(durationMonths, startDate) {
  const today = new Date()
  const start = new Date(startDate)

  const monthsPassed = Math.max(
    0,
    (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth()),
  )

  return Math.max(0, durationMonths - monthsPassed)
}

/**
 * Simule un remboursement anticipé.
 * Retourne deux options : réduire la durée ou réduire la mensualité.
 *
 * @param {number} remainingBalance - Solde restant dû
 * @param {number} annualRate - Taux annuel en %
 * @param {number} remainingMonths - Mois restants
 * @param {number} earlyPayment - Montant du remboursement anticipé
 * @returns {object}
 */
export function simulateEarlyRepayment(remainingBalance, annualRate, remainingMonths, earlyPayment) {
  if (!earlyPayment || earlyPayment <= 0) {
    return { valid: false, message: 'Le montant doit être supérieur à 0 €.' }
  }
  if (earlyPayment >= remainingBalance) {
    return {
      valid: false,
      message: `Le montant saisi (${earlyPayment.toLocaleString('fr-FR')} €) dépasse le solde restant (${remainingBalance.toLocaleString('fr-FR')} €).`,
    }
  }

  const r = annualRate / 100 / 12
  const newBalance = remainingBalance - earlyPayment
  const currentMonthly = calculateMonthlyPayment(remainingBalance, annualRate, remainingMonths)

  // Option 1 : Même mensualité → durée réduite
  let newDuration
  if (r === 0) {
    newDuration = Math.ceil(newBalance / currentMonthly)
  } else {
    const ratio = (r * newBalance) / currentMonthly
    if (ratio >= 1) {
      // Cas théoriquement impossible pour des paramètres cohérents
      newDuration = remainingMonths
    } else {
      newDuration = Math.ceil(-Math.log(1 - ratio) / Math.log(1 + r))
    }
  }
  const savedMonths = remainingMonths - newDuration

  // Option 2 : Même durée → mensualité réduite
  const newMonthlyPayment = calculateMonthlyPayment(newBalance, annualRate, remainingMonths)
  const savedPerMonth = currentMonthly - newMonthlyPayment

  return {
    valid: true,
    newBalance,
    currentMonthly,
    remainingMonths,
    // Option 1
    reducedDuration: newDuration,
    savedMonths,
    // Option 2
    reducedMonthly: newMonthlyPayment,
    savedPerMonth,
  }
}
