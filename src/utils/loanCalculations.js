/**
 * Retourne le taux annuel en fonction du montant demandé.
 * < 10 000 € → 8 %
 * 10 000 – 50 000 € → 6 %
 * > 50 000 € → 4,5 %
 */
export function getInterestRate(amount) {
  if (amount < 10000) return 0.08
  if (amount <= 50000) return 0.06
  return 0.045
}

/**
 * Calcule la mensualité (formule d'amortissement classique).
 * M = P × [r(1+r)ⁿ] / [(1+r)ⁿ−1]
 */
export function calculateMonthlyPayment(principal, annualRate, months) {
  if (months <= 0 || principal <= 0) return 0
  const r = annualRate / 12
  if (r === 0) return principal / months
  const factor = Math.pow(1 + r, months)
  return (principal * r * factor) / (factor - 1)
}

/**
 * Génère le tableau d'amortissement complet (décroissant).
 * Retourne un tableau d'entrées mensuelles depuis startDate.
 */
export function generateSchedule(principal, annualRate, months, startDate) {
  if (months <= 0 || principal <= 0) return []
  const r = annualRate / 12
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, months)
  let balance = principal
  const schedule = []
  const start = new Date(startDate)

  for (let i = 1; i <= months; i++) {
    const interest = balance * r
    const capital = monthlyPayment - interest
    balance = Math.max(0, balance - capital)

    const paymentDate = new Date(start)
    paymentDate.setMonth(paymentDate.getMonth() + i)

    schedule.push({
      month: i,
      date: paymentDate.toISOString().slice(0, 10),
      capital: Math.round(capital * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      total: Math.round(monthlyPayment * 100) / 100,
      remainingBalance: Math.round(balance * 100) / 100,
    })
  }

  return schedule
}

/**
 * Retourne uniquement les échéances futures (date >= aujourd'hui).
 */
export function getRemainingSchedule(principal, annualRate, months, startDate) {
  const full = generateSchedule(principal, annualRate, months, startDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return full.filter((e) => new Date(e.date) >= today)
}

/**
 * Calcule les données d'un remboursement anticipé.
 * earlyAmount : montant du remboursement anticipé
 * remainingMonths : nombre de mois restants
 */
export function calculateEarlyRepayment(
  remainingBalance,
  annualRate,
  remainingMonths,
  earlyAmount,
) {
  const today = new Date().toISOString().slice(0, 10)

  // Intérêts totaux restants avec le plan actuel
  const currentSchedule = generateSchedule(
    remainingBalance,
    annualRate,
    remainingMonths,
    today,
  )
  const currentTotalInterest = currentSchedule.reduce(
    (sum, e) => sum + e.interest,
    0,
  )

  if (earlyAmount >= remainingBalance) {
    // Remboursement total
    return {
      exitAmount: Math.round(remainingBalance * 100) / 100,
      savedInterest: Math.round(currentTotalInterest * 100) / 100,
      newBalance: 0,
      newSchedule: [],
    }
  }

  // Remboursement partiel
  const newBalance = remainingBalance - earlyAmount
  const newSchedule = generateSchedule(
    newBalance,
    annualRate,
    remainingMonths,
    today,
  )
  const newTotalInterest = newSchedule.reduce((sum, e) => sum + e.interest, 0)

  return {
    exitAmount: Math.round(earlyAmount * 100) / 100,
    savedInterest: Math.round((currentTotalInterest - newTotalInterest) * 100) / 100,
    newBalance: Math.round(newBalance * 100) / 100,
    newSchedule,
  }
}
