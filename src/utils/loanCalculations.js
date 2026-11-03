/**
 * Calcul de mensualité (amortissement standard)
 * M = P × [r(1+r)^n] / [(1+r)^n - 1]
 * P = capital, r = taux mensuel (annuel/12/100), n = nombre de mois
 */
export function calculateMonthlyPayment(principal, annualRate, termMonths) {
  if (principal <= 0 || termMonths <= 0) return 0
  const r = annualRate / 12 / 100
  if (r === 0) return Math.round((principal / termMonths) * 100) / 100
  const factor = Math.pow(1 + r, termMonths)
  const payment = (principal * r * factor) / (factor - 1)
  return Math.round(payment * 100) / 100
}

/**
 * Calcul du coût total des intérêts
 */
export function calculateTotalInterest(principal, annualRate, termMonths) {
  const monthly = calculateMonthlyPayment(principal, annualRate, termMonths)
  return Math.round((monthly * termMonths - principal) * 100) / 100
}

/**
 * Calcul du coût total remboursé
 */
export function calculateTotalRepaid(principal, annualRate, termMonths) {
  const monthly = calculateMonthlyPayment(principal, annualRate, termMonths)
  return Math.round(monthly * termMonths * 100) / 100
}

/**
 * Génère le tableau d'amortissement complet.
 * Retourne un tableau de lignes : { month, date, payment, principal, interest, balance }
 */
export function generateSchedule(principal, annualRate, termMonths, startDate) {
  const r = annualRate / 12 / 100
  const monthly = calculateMonthlyPayment(principal, annualRate, termMonths)
  const schedule = []
  let balance = principal

  for (let i = 1; i <= termMonths; i++) {
    const interest = Math.round(balance * r * 100) / 100
    let principalPart

    if (i === termMonths) {
      // Dernier paiement : solder le reste exactement
      principalPart = Math.round(balance * 100) / 100
    } else {
      principalPart = Math.round((monthly - interest) * 100) / 100
    }

    balance = Math.max(0, Math.round((balance - principalPart) * 100) / 100)

    const paymentDate = new Date(startDate + 'T00:00:00')
    paymentDate.setMonth(paymentDate.getMonth() + i)

    schedule.push({
      month: i,
      date: paymentDate.toISOString().split('T')[0],
      payment: Math.round((principalPart + interest) * 100) / 100,
      principal: principalPart,
      interest,
      balance,
    })
  }

  return schedule
}

/**
 * Retourne le solde actuel basé sur le planning et la date du jour
 */
export function getCurrentBalanceFromSchedule(originalAmount, schedule) {
  if (!schedule || schedule.length === 0) return originalAmount
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const paidEntries = schedule.filter((e) => new Date(e.date) <= today)
  if (paidEntries.length === 0) return originalAmount
  return paidEntries[paidEntries.length - 1].balance
}

/**
 * Retourne le nombre de mois restants basé sur le planning et la date du jour
 */
export function getRemainingMonths(schedule) {
  if (!schedule || schedule.length === 0) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return schedule.filter((e) => new Date(e.date) > today).length
}

/**
 * Calcule l'impact d'un remboursement anticipé
 * reduceOption : 'reduce_term' (même mensualité, durée réduite)
 *              | 'reduce_payment' (même durée, mensualité réduite)
 */
export function calculateEarlyRepaymentImpact(
  currentBalance,
  repaymentAmount,
  annualRate,
  remainingMonths,
  reduceOption = 'reduce_term',
) {
  const effectiveRepayment = Math.min(Math.max(0, repaymentAmount), currentBalance)
  const newBalance = Math.round((currentBalance - effectiveRepayment) * 100) / 100

  const currentMonthly = calculateMonthlyPayment(currentBalance, annualRate, remainingMonths)
  const oldRemainingInterest = Math.max(
    0,
    Math.round((currentMonthly * remainingMonths - currentBalance) * 100) / 100,
  )

  if (newBalance === 0) {
    return {
      repaymentAmount: effectiveRepayment,
      newBalance: 0,
      newMonthlyPayment: 0,
      newTerm: 0,
      newSchedule: [],
      interestSaved: oldRemainingInterest,
      isFullRepayment: true,
    }
  }

  let newTerm, newMonthlyPayment

  if (reduceOption === 'reduce_term') {
    // Même mensualité qu'avant, durée réduite
    newMonthlyPayment = currentMonthly
    const r = annualRate / 12 / 100
    if (r === 0) {
      newTerm = Math.ceil(newBalance / newMonthlyPayment)
    } else {
      const ratio = (r * newBalance) / newMonthlyPayment
      if (ratio >= 1) {
        newTerm = remainingMonths
      } else {
        newTerm = Math.ceil(-Math.log(1 - ratio) / Math.log(1 + r))
      }
    }
    newTerm = Math.max(1, Math.min(newTerm, remainingMonths))
  } else {
    // Même durée, mensualité réduite
    newTerm = remainingMonths
    newMonthlyPayment = calculateMonthlyPayment(newBalance, annualRate, newTerm)
  }

  const today = new Date().toISOString().split('T')[0]
  const newSchedule = generateSchedule(newBalance, annualRate, newTerm, today)

  const newRemainingInterest = Math.max(
    0,
    Math.round((newMonthlyPayment * newTerm - newBalance) * 100) / 100,
  )
  const interestSaved = Math.max(
    0,
    Math.round((oldRemainingInterest - newRemainingInterest) * 100) / 100,
  )

  return {
    repaymentAmount: effectiveRepayment,
    newBalance,
    newMonthlyPayment: Math.round(newMonthlyPayment * 100) / 100,
    newTerm,
    newSchedule,
    interestSaved,
    isFullRepayment: false,
  }
}
