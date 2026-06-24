import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useYieldCounterDirectMxn } from './useYieldCounter'

describe('useYieldCounterDirectMxn', () => {
  const MS_PER_YEAR = 365 * 24 * 60 * 60 * 1000

  beforeEach(() => {
    vi.useFakeTimers()
    // Set a fixed system time for determinism: 2026-06-24 10:00:00
    const mockDate = new Date(2026, 5, 24, 10, 0, 0)
    vi.setSystemTime(mockDate)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Paused state', () => {
    it('should return paused state when running=false', () => {
      const { result } = renderHook(() => useYieldCounterDirectMxn(1000, 5, false))
      
      expect(result.current.isGrowing).toBe(false)
      expect(result.current.yieldTodayMxn).toBe(0)
      expect(result.current.displayBalance).toBe(1000)
    })

    it('should return paused state when realBalance <= 0', () => {
      const { result } = renderHook(() => useYieldCounterDirectMxn(0, 5, true))
      
      expect(result.current.isGrowing).toBe(false)
      expect(result.current.yieldTodayMxn).toBe(0)
      expect(result.current.displayBalance).toBe(0)
    })
  })

  describe('Growing state', () => {
    it('should increase displayBalance over time when running=true and realBalance > 0', () => {
      const { result } = renderHook(() => useYieldCounterDirectMxn(1000, 10, true))
      
      const initialBalance = result.current.displayBalance
      
      act(() => {
        vi.advanceTimersByTime(1000) // 1 second
      })
      
      expect(result.current.isGrowing).toBe(true)
      expect(result.current.displayBalance).toBeGreaterThan(initialBalance)
    })
  })

  describe('Per millisecond growth', () => {
    it('should match the expected growth rate (annualYieldRate / 100 / msPerYear)', () => {
      const realBalance = 1000000 // 1M for precision
      const annualYieldRate = 10 // 10%
      
      const { result } = renderHook(() => useYieldCounterDirectMxn(realBalance, annualYieldRate, true))
      
      // Initial yield at 10:00:00 (10 hours since midnight)
      const initialYield = result.current.yieldTodayMxn
      
      const advanceMs = 10000 // 10 seconds
      act(() => {
        vi.advanceTimersByTime(advanceMs)
      })
      
      const ratePerMs = (annualYieldRate / 100) / MS_PER_YEAR
      const expectedGrowth = realBalance * ratePerMs * advanceMs
      const actualGrowth = result.current.yieldTodayMxn - initialYield
      
      // Using toBeCloseTo for float precision
      expect(actualGrowth).toBeCloseTo(expectedGrowth, 8)
    })
  })

  describe('Midnight reset', () => {
    it('should reset yieldTodayMxn correctly when advancing across midnight', () => {
      // Set time to 23:59:50
      const almostMidnight = new Date(2026, 5, 24, 23, 59, 50)
      vi.setSystemTime(almostMidnight)
      
      const { result } = renderHook(() => useYieldCounterDirectMxn(1000, 10, true))
      
      expect(result.current.yieldTodayMxn).toBeGreaterThan(0)
      
      // Advance by 20 seconds to cross midnight (into 2026-06-25 00:00:10)
      act(() => {
        vi.advanceTimersByTime(20000)
      })
      
      // At 00:00:10, yieldTodayMxn should only represent 10 seconds of growth
      const ratePerMs = (10 / 100) / MS_PER_YEAR
      const expectedYieldAfterMidnight = 1000 * ratePerMs * 10000
      
      expect(result.current.yieldTodayMxn).toBeCloseTo(expectedYieldAfterMidnight, 8)
    })
  })
})
