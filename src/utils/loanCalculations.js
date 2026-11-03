/**
 * Calcule le taux d'intérêt annuel selon le montant emprunté
 * Grille : ≤10 000 € → 4,5 % | ≤25 000 € → 3,8 % | >25 000 € → 3,2 %
 */
export function calculateInterestRate(amount) {
  if (amount <= 10000) return 0.045
  if (amount <= 25000) return 0.038
  return 0.032
}

/**
 * Calcule la mensualité par la formule d'annuité constante
 * monthlyPayment = principal * (rate * (1 + rate)^n) / ((1 + rate)^n - 1)
 * où rate = taux annuel / 12 et n = durée en mois
 */
export function calculateMonthlyPayment(principal, annualRate, durationMonths) {
  const monthlyRate = annualRate / 12
  if (monthlyRate === 0) return principal / durationMonths
  const pow = Math.pow(1 + monthlyRate, durationMonths)
  return (principal * (monthlyRate * pow)) / (pow - 1)
}

/**
 * Calcule le coût total du crédit (somme de toutes les mensualités)
 */
export function calculateTotalCost(monthlyPayment, durationMonths) {
  return monthlyPayment * durationMonths
}

/**
 * Génère le tableau d'amortissement complet
 * Chaque entrée : { n, date, capital, interest, payment, remainingBalance }
 */
export function calculateSchedule(principal, annualRate, durationMonths, startDate) {
  const monthlyRate = annualRate / 12
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, durationMonths)
  const schedule = []
  let balance = principal

  for (let i = 1; i <= durationMonths; i++) {
    const interest = balance * monthlyRate
    const capital = monthlyPayment - interest
    balance = Math.max(0, balance - capital)

    const date = new Date(startDate)
    date.setMonth(date.getMonth() + i)

    schedule.push({
      n: i,
      date: date.toISOString().split('T')[0],
      capital: Math.round(capital * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      payment: Math.round(monthlyPayment * 100) / 100,
      remainingBalance: Math.round(balance * 100) / 100,
    })
  }

  return schedule
}

/**
 * Simule l'impact d'un remboursement anticipé (partiel ou total)
 * Conserve la même mensualité et calcule la nouvelle durée restante.
 *
 * @param {number} currentBalance     Solde restant dû
 * @param {number} repaymentAmount    Montant souhaité pour le remboursement anticipé
 * @param {number} annualRate         Taux annuel (ex. 0.045)
 * @param {number} remainingMonths    Nombre de mensualités restantes
 * @returns {object} impact
 */
export function calculateEarlyRepaymentImpact(
  currentBalance,
  repaymentAmount,
  annualRate,
  remainingMonths,
) {
  // Plafonner le remboursement au solde restant
  const actualRepayment = Math.min(repaymentAmount, currentBalance)
  const newBalance = Math.max(0, currentBalance - actualRepayment)

  if (newBalance <= 0) {
    return {
      newBalance: 0,
      newMonthlyPayment: 0,
      newDuration: 0,
      savedInterest: 0,
      isFullRepayment: true,
      actualRepayment,
    }
  }

  const monthlyRate = annualRate / 12
  const currentMonthlyPayment = calculateMonthlyPayment(currentBalance, annualRate, remainingMonths)

  // Nouvelle durée : n = -ln(1 - newBalance * r / PMT) / ln(1 + r)
  const newDuration = Math.ceil(
    -Math.log(1 - (newBalance * monthlyRate) / currentMonthlyPayment) /
      Math.log(1 + monthlyRate),
  )

  // Intérêts économisés = réduction des paiements futurs - montant du remboursement anticipé
  const savedInterest = Math.max(
    0,
    currentMonthlyPayment * (remainingMonths - newDuration) - actualRepayment,
  )

  return {
    newBalance: Math.round(newBalance * 100) / 100,
    newMonthlyPayment: Math.round(currentMonthlyPayment * 100) / 100,
    newDuration,
    savedInterest: Math.round(savedInterest * 100) / 100,
    isFullRepayment: false,
    actualRepayment,
  }
}
