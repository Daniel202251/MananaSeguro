export const MONTO_MINIMO_MXN = 40
export const MONTO_MAXIMO_MXN = 100000

/**
 * Validates the user ID.
 * @param {string} userId
 * @throws {Error} if userId is missing
 */
export function validateUserId(userId) {
  if (!userId) {
    throw new Error('usuarioId requerido')
  }
  return true
}

/**
 * Validates the deposit amount.
 * @param {number|any} amount
 * @throws {Error} if amount is missing, not a number, below minimum, or above maximum
 */
export function validateAmount(amount) {
  if (amount === undefined || amount === null || amount === '') {
    throw new Error('montoMxn requerido y debe ser numérico')
  }
  if (typeof amount !== 'number' || isNaN(amount) || amount === 0) {
    throw new Error('montoMxn requerido y debe ser numérico')
  }
  if (amount < MONTO_MINIMO_MXN) {
    throw new Error(`Monto mínimo: $${MONTO_MINIMO_MXN} MXN`)
  }
  if (amount > MONTO_MAXIMO_MXN) {
    throw new Error(`Monto máximo: $${MONTO_MAXIMO_MXN.toLocaleString('es-MX')} MXN`)
  }
  return true
}

/**
 * Validates the user KYC status.
 * @param {string} kycStatus
 * @throws {Error} if kycStatus is not 'approved'
 */
export function validateKyc(kycStatus) {
  if (!kycStatus || kycStatus !== 'approved') {
    throw new Error('KYC pendiente')
  }
  return true
}
