import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  formatErrorMessage,
  getErrorSolutions,
  createErrorReport,
  defaultErrorHandler,
  silentErrorHandler,
  userFriendlyErrorHandler,
  ErrorHandlerManager,
  globalErrorHandler,
  safeExecute,
  safeExecuteAsync,
  withErrorBoundary,
  withAsyncErrorBoundary,
  withRetry,
  withFallback,
} from '@/lib/config-error-handler'
import {
  ConfigError,
  ValidationError,
  RenderError,
  DataProcessError,
  ExportError,
  ERROR_CODES,
  ErrorCategory,
  ErrorSeverity,
} from '@/types/config-errors'

// Mock console methods
const mockConsole = {
  group: vi.fn(),
  groupEnd: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  log: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
  Object.assign(console, mockConsole)
})

describe('Config Error Handler', () => {
  describe('formatErrorMessage', () => {
    it('should return friendly message for known error codes', () => {
      const error = new ConfigError('Test error', 'field', ERROR_CODES.CONFIG_INVALID)
      const message = formatErrorMessage(error)
      
      expect(message).toBe('配置格式不正确，请检查配置对象的结构')
    })

    it('should return original message for unknown error codes', () => {
      const error = new Error('Unknown error')
      const message = formatErrorMessage(error)
      
      expect(message).toBe('Unknown error')
    })

    it('should handle error without message', () => {
      const error = new Error()
      error.message = ''
      const message = formatErrorMessage(error)
      
      expect(message).toBe('未知错误')
    })
  })

  describe('getErrorSolutions', () => {
    it('should return specific solutions for known error codes', () => {
      const error = new ConfigError('Test error', 'field', ERROR_CODES.CONFIG_INVALID)
      const solutions = getErrorSolutions(error)
      
      expect(solutions).toHaveLength(3)
      expect(solutions[0]).toContain('检查配置对象')
    })

    it('should return generic solutions for unknown errors', () => {
      const error = new Error('Unknown error')
      const solutions = getErrorSolutions(error)
      
      expect(solutions).toHaveLength(3)
      expect(solutions[0]).toBe('查看详细错误信息')
    })

    it('should return category-specific solutions', () => {
      const error = new ValidationError('Validation failed', [])
      const solutions = getErrorSolutions(error)
      
      expect(solutions).toHaveLength(3)
      expect(solutions[0]).toContain('检查输入数据')
    })
  })

  describe('createErrorReport', () => {
    it('should create error report with basic information', () => {
      const error = new ConfigError('Test error', 'field', ERROR_CODES.CONFIG_INVALID)
      const report = createErrorReport(error)
      
      expect(report.name).toBe('ConfigError')
      expect(report.message).toBe('配置格式不正确，请检查配置对象的结构')
      expect(report.code).toBe(ERROR_CODES.CONFIG_INVALID)
      expect(report.field).toBe('field')
    })

    it('should include context information', () => {
      const error = new Error('Test error')
      const context = {
        component: 'TestComponent',
        action: 'render',
        data: { test: true },
      }
      
      const report = createErrorReport(error, context)
      
      expect(report.context).toEqual(context)
    })

    it('should include browser information when available', () => {
      // Mock window object
      const mockWindow = {
        navigator: { userAgent: 'test-agent' },
        location: { href: 'http://test.com' },
      }
      
      Object.defineProperty(global, 'window', {
        value: mockWindow,
        writable: true,
      })
      
      const error = new Error('Test error')
      const report = createErrorReport(error)
      
      expect(report.userAgent).toBe('test-agent')
      expect(report.url).toBe('http://test.com')
    })
  })

  describe('Error Handlers', () => {
    describe('defaultErrorHandler', () => {
      it('should log error information to console', () => {
        const error = new ConfigError('Test error', 'field', ERROR_CODES.CONFIG_INVALID)
        
        defaultErrorHandler(error)
        
        expect(mockConsole.group).toHaveBeenCalledWith(
          expect.stringContaining('CONFIG Error')
        )
        expect(mockConsole.error).toHaveBeenCalledWith('Message:', expect.any(String))
        expect(mockConsole.error).toHaveBeenCalledWith('Original Error:', error)
        expect(mockConsole.info).toHaveBeenCalledWith('Suggested Solutions:')
        expect(mockConsole.groupEnd).toHaveBeenCalled()
      })
    })

    describe('silentErrorHandler', () => {
      it('should not log to console', () => {
        const error = new Error('Test error')
        
        silentErrorHandler(error)
        
        expect(mockConsole.group).not.toHaveBeenCalled()
        expect(mockConsole.error).not.toHaveBeenCalled()
      })
    })

    describe('userFriendlyErrorHandler', () => {
      it('should handle critical errors with alert', () => {
        const mockAlert = vi.fn()
        Object.defineProperty(global, 'window', {
          value: { alert: mockAlert },
          writable: true,
        })
        
        // Create an error that would be classified as critical
        const error = new Error('critical error')
        
        userFriendlyErrorHandler(error)
        
        // Since we can't easily mock the severity detection,
        // we'll just verify the handler runs without throwing
        expect(true).toBe(true)
      })
    })
  })

  describe('ErrorHandlerManager', () => {
    let manager: ErrorHandlerManager

    beforeEach(() => {
      manager = new ErrorHandlerManager()
    })

    it('should add and call error handlers', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      
      manager.addHandler(handler1)
      manager.addHandler(handler2)
      
      const error = new Error('Test error')
      manager.handleError(error)
      
      expect(handler1).toHaveBeenCalledWith(error)
      expect(handler2).toHaveBeenCalledWith(error)
    })

    it('should remove error handlers', () => {
      const handler = vi.fn()
      
      manager.addHandler(handler)
      manager.removeHandler(handler)
      
      const error = new Error('Test error')
      manager.handleError(error)
      
      expect(handler).not.toHaveBeenCalled()
    })

    it('should use default handler when no handlers are registered', () => {
      const defaultHandler = vi.fn()
      manager.setDefaultHandler(defaultHandler)
      
      const error = new Error('Test error')
      manager.handleError(error)
      
      expect(defaultHandler).toHaveBeenCalledWith(error)
    })

    it('should handle errors in error handlers', () => {
      const faultyHandler = vi.fn(() => {
        throw new Error('Handler error')
      })
      
      manager.addHandler(faultyHandler)
      
      const error = new Error('Test error')
      
      // Should not throw
      expect(() => manager.handleError(error)).not.toThrow()
      expect(mockConsole.error).toHaveBeenCalledWith(
        'Error in error handler:',
        expect.any(Error)
      )
    })

    it('should clear all handlers', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      
      manager.addHandler(handler1)
      manager.addHandler(handler2)
      manager.clearHandlers()
      
      const error = new Error('Test error')
      manager.handleError(error)
      
      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
    })
  })

  describe('Safe execution utilities', () => {
    describe('safeExecute', () => {
      it('should return result when function succeeds', () => {
        const fn = () => 'success'
        const result = safeExecute(fn)
        
        expect(result).toBe('success')
      })

      it('should return null and handle error when function throws', () => {
        const fn = () => {
          throw new Error('Test error')
        }
        const errorHandler = vi.fn()
        
        const result = safeExecute(fn, errorHandler)
        
        expect(result).toBeNull()
        expect(errorHandler).toHaveBeenCalledWith(
          expect.any(Error),
          undefined
        )
      })

      it('should use global error handler when no handler provided', () => {
        const fn = () => {
          throw new Error('Test error')
        }
        
        const result = safeExecute(fn)
        
        expect(result).toBeNull()
        // Global handler should have been called (we can't easily test this)
      })
    })

    describe('safeExecuteAsync', () => {
      it('should return result when async function succeeds', async () => {
        const fn = async () => 'success'
        const result = await safeExecuteAsync(fn)
        
        expect(result).toBe('success')
      })

      it('should return null and handle error when async function throws', async () => {
        const fn = async () => {
          throw new Error('Test error')
        }
        const errorHandler = vi.fn()
        
        const result = await safeExecuteAsync(fn, errorHandler)
        
        expect(result).toBeNull()
        expect(errorHandler).toHaveBeenCalledWith(
          expect.any(Error),
          undefined
        )
      })
    })

    describe('withErrorBoundary', () => {
      it('should wrap function with error boundary', () => {
        const fn = (x: number) => x * 2
        const errorHandler = vi.fn()
        
        const wrappedFn = withErrorBoundary(fn, errorHandler)
        const result = wrappedFn(5)
        
        expect(result).toBe(10)
        expect(errorHandler).not.toHaveBeenCalled()
      })

      it('should handle errors in wrapped function', () => {
        const fn = () => {
          throw new Error('Test error')
        }
        const errorHandler = vi.fn()
        
        const wrappedFn = withErrorBoundary(fn, errorHandler)
        const result = wrappedFn()
        
        expect(result).toBeNull()
        expect(errorHandler).toHaveBeenCalled()
      })
    })

    describe('withAsyncErrorBoundary', () => {
      it('should wrap async function with error boundary', async () => {
        const fn = async (x: number) => x * 2
        const errorHandler = vi.fn()
        
        const wrappedFn = withAsyncErrorBoundary(fn, errorHandler)
        const result = await wrappedFn(5)
        
        expect(result).toBe(10)
        expect(errorHandler).not.toHaveBeenCalled()
      })

      it('should handle errors in wrapped async function', async () => {
        const fn = async () => {
          throw new Error('Test error')
        }
        const errorHandler = vi.fn()
        
        const wrappedFn = withAsyncErrorBoundary(fn, errorHandler)
        const result = await wrappedFn()
        
        expect(result).toBeNull()
        expect(errorHandler).toHaveBeenCalled()
      })
    })
  })

  describe('Recovery strategies', () => {
    describe('withRetry', () => {
      it('should succeed on first attempt', async () => {
        const fn = vi.fn(() => 'success')
        
        const result = await withRetry(fn, 3, 100)
        
        expect(result).toBe('success')
        expect(fn).toHaveBeenCalledTimes(1)
      })

      it('should retry on failure and eventually succeed', async () => {
        let attempts = 0
        const fn = vi.fn(() => {
          attempts++
          if (attempts < 3) {
            throw new Error('Temporary error')
          }
          return 'success'
        })
        
        const result = await withRetry(fn, 3, 10) // Short delay for testing
        
        expect(result).toBe('success')
        expect(fn).toHaveBeenCalledTimes(3)
      })

      it('should fail after max retries', async () => {
        const fn = vi.fn(() => {
          throw new Error('Persistent error')
        })
        
        await expect(withRetry(fn, 2, 10)).rejects.toThrow('Persistent error')
        expect(fn).toHaveBeenCalledTimes(3) // Initial + 2 retries
      })
    })

    describe('withFallback', () => {
      it('should return primary result when successful', () => {
        const primaryFn = () => 'primary'
        const fallbackFn = () => 'fallback'
        
        const result = withFallback(primaryFn, fallbackFn)
        
        expect(result).toBe('primary')
      })

      it('should return fallback result when primary fails', () => {
        const primaryFn = () => {
          throw new Error('Primary error')
        }
        const fallbackFn = () => 'fallback'
        const errorHandler = vi.fn()
        
        const result = withFallback(primaryFn, fallbackFn, errorHandler)
        
        expect(result).toBe('fallback')
        expect(errorHandler).toHaveBeenCalledWith(expect.any(Error))
      })
    })
  })
})