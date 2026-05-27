import { describe, it, expect } from 'vitest'
import { validateUserId, validateAmount, validateKyc } from './depositValidation.js'

describe('depositValidation', () => {
  describe('validateUserId', () => {
    it('should throw error when userId is missing', () => {
      expect(() => validateUserId()).toThrow('usuarioId requerido')
      expect(() => validateUserId(null)).toThrow('usuarioId requerido')
      expect(() => validateUserId('')).toThrow('usuarioId requerido')
    })

    it('should pass and return true when userId is valid', () => {
      expect(validateUserId('user-123')).toBe(true)
    })
  })

  describe('validateAmount', () => {
    it('should throw error when amount is below minimum', () => {
      expect(() => validateAmount(39)).toThrow('Monto mínimo: $40 MXN')
    })

    it('should throw error when amount is above maximum', () => {
      expect(() => validateAmount(100001)).toThrow('Monto máximo: $100,000 MXN')
    })

    it('should throw error when amount is a string', () => {
      expect(() => validateAmount('40')).toThrow('montoMxn requerido y debe ser numérico')
      expect(() => validateAmount('abc')).toThrow('montoMxn requerido y debe ser numérico')
    })

    it('should throw error when amount is negative', () => {
      expect(() => validateAmount(-50)).toThrow('Monto mínimo: $40 MXN')
    })

    it('should throw error when amount is missing or NaN or zero', () => {
      expect(() => validateAmount()).toThrow('montoMxn requerido y debe ser numérico')
      expect(() => validateAmount(null)).toThrow('montoMxn requerido y debe ser numérico')
      expect(() => validateAmount(NaN)).toThrow('montoMxn requerido y debe ser numérico')
      expect(() => validateAmount(0)).toThrow('montoMxn requerido y debe ser numérico')
    })

    it('should pass and return true when amount is valid', () => {
      expect(validateAmount(40)).toBe(true)
      expect(validateAmount(5000)).toBe(true)
      expect(validateAmount(100000)).toBe(true)
    })
  })

  describe('validateKyc', () => {
    it('should throw error when KYC is pending', () => {
      expect(() => validateKyc('pending')).toThrow('KYC pendiente')
    })

    it('should throw error when KYC is rejected', () => {
      expect(() => validateKyc('rejected')).toThrow('KYC pendiente')
    })

    it('should throw error when KYC is missing', () => {
      expect(() => validateKyc()).toThrow('KYC pendiente')
      expect(() => validateKyc(null)).toThrow('KYC pendiente')
    })

    it('should pass and return true when KYC is approved', () => {
      expect(validateKyc('approved')).toBe(true)
    })
  })
})
