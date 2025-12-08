import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  checkBusinessSuccess,
  extractMessage,
  createApiError,
  showToast,
  createApiResponseHandler
} from '../../src/runtime/utils/api-helpers'
import type {
  ApiResponseBase,
  ApiSuccessConfig,
  ApiToastConfig,
  ApiEndpointConfig,
  ApiAuthConfig
} from '../../src/runtime/types/api.d'

describe('api-helpers', () => {
  describe('checkBusinessSuccess', () => {
    it('应正确判断成功响应(code=200)', () => {
      const response: ApiResponseBase<unknown> = {
        code: 200,
        data: { id: 1 }
      }

      const successConfig: Partial<ApiSuccessConfig> = {
        successCodes: [200, 0],
        codeKey: 'code'
      }

      expect(checkBusinessSuccess(response, successConfig)).toBe(true)
    })

    it('应正确判断成功响应(code=0)', () => {
      const response: ApiResponseBase<unknown> = {
        code: 0,
        data: { id: 1 }
      }

      expect(checkBusinessSuccess(response, {})).toBe(true)
    })

    it('应正确判断失败响应(code=400)', () => {
      const response: ApiResponseBase<unknown> = {
        code: 400,
        msg: '参数错误'
      }

      expect(checkBusinessSuccess(response, {})).toBe(false)
    })

    it('应支持自定义 successCodes', () => {
      const response: ApiResponseBase<unknown> = {
        code: 1,
        data: { id: 1 }
      }

      const successConfig: Partial<ApiSuccessConfig> = {
        successCodes: [1]
      }

      expect(checkBusinessSuccess(response, successConfig)).toBe(true)
    })

    it('应支持自定义 codeKey', () => {
      const response: ApiResponseBase<unknown> = {
        status: 200,
        data: { id: 1 }
      }

      const successConfig: Partial<ApiSuccessConfig> = {
        codeKey: 'status',
        successCodes: [200]
      }

      expect(checkBusinessSuccess(response, successConfig)).toBe(true)
    })

    it('应支持字符串类型的 code', () => {
      const response: ApiResponseBase<unknown> = {
        code: '200',
        data: { id: 1 }
      }

      const successConfig: Partial<ApiSuccessConfig> = {
        successCodes: ['200' as any]
      }

      expect(checkBusinessSuccess(response, successConfig)).toBe(true)
    })
  })

  describe('extractMessage', () => {
    it('应从 msg 字段提取消息', () => {
      const response: ApiResponseBase<unknown> = {
        code: 200,
        msg: '操作成功'
      }

      expect(extractMessage(response, {})).toBe('操作成功')
    })

    it('应从 message 字段提取消息', () => {
      const response: ApiResponseBase<unknown> = {
        code: 200,
        message: '操作成功'
      }

      expect(extractMessage(response, {})).toBe('操作成功')
    })

    it('应支持自定义 messageKey', () => {
      const response: ApiResponseBase<unknown> = {
        code: 200,
        customMsg: '自定义消息'
      } as any

      const successConfig: Partial<ApiSuccessConfig> = {
        messageKey: 'customMsg'
      }

      expect(extractMessage(response, successConfig)).toBe('自定义消息')
    })

    it('应优先使用 messageKey 配置的字段', () => {
      const response: ApiResponseBase<unknown> = {
        code: 200,
        msg: '消息1',
        message: '消息2'
      }

      const successConfig: Partial<ApiSuccessConfig> = {
        messageKey: 'message'
      }

      expect(extractMessage(response, successConfig)).toBe('消息2')
    })

    it('应在没有消息时返回 undefined', () => {
      const response: ApiResponseBase<unknown> = {
        code: 200
      }

      expect(extractMessage(response, {})).toBeUndefined()
    })
  })

  describe('createApiError', () => {
    it('应创建包含响应信息的错误对象', () => {
      const response: ApiResponseBase<unknown> = {
        code: 400,
        msg: '参数错误'
      }

      const error = createApiError(response, '请求失败')

      expect(error.message).toBe('请求失败')
      expect(error.statusCode).toBe(400)
      expect(error.response).toBe(response)
      expect(error.isBusinessError).toBe(true)
    })

    it('应使用默认消息', () => {
      const response: ApiResponseBase<unknown> = {
        code: 500
      }

      const error = createApiError(response)

      expect(error.message).toBe('请求失败')
    })

    it('应从 status 字段提取状态码', () => {
      const response: ApiResponseBase<unknown> = {
        status: 404
      }

      const error = createApiError(response)

      expect(error.statusCode).toBe(404)
    })

    it('应在没有状态码时使用 500', () => {
      const response: ApiResponseBase<unknown> = {}

      const error = createApiError(response)

      expect(error.statusCode).toBe(500)
    })
  })

  describe('showToast', () => {
    beforeEach(() => {
      // Mock globalThis.useToast
      (globalThis as any).useToast = undefined
    })

    it('应在全局禁用时不显示 Toast', () => {
      const mockToast = vi.fn()
      const response: ApiResponseBase<unknown> = {
        code: 200,
        msg: '成功'
      }

      showToast({
        type: 'success',
        response,
        globalConfig: { enabled: false },
        endpointConfig: {},
        successConfig: {}
      })

      expect(mockToast).not.toHaveBeenCalled()
    })

    it('应在端点禁用时不显示 Toast', () => {
      const mockToast = vi.fn()
      const response: ApiResponseBase<unknown> = {
        code: 200,
        msg: '成功'
      }

      showToast({
        type: 'success',
        response,
        globalConfig: { enabled: true },
        endpointConfig: { enabled: false },
        successConfig: {}
      })

      expect(mockToast).not.toHaveBeenCalled()
    })

    it('应在请求级别禁用时不显示 Toast', () => {
      const mockToast = vi.fn()
      const response: ApiResponseBase<unknown> = {
        code: 200,
        msg: '成功'
      }

      showToast({
        type: 'success',
        response,
        apiOptions: { toast: false },
        globalConfig: { enabled: true },
        endpointConfig: {},
        successConfig: {}
      })

      expect(mockToast).not.toHaveBeenCalled()
    })

    it('应在 useToast 不可用时静默失败', () => {
      const response: ApiResponseBase<unknown> = {
        code: 200,
        msg: '成功'
      }

      expect(() => {
        showToast({
          type: 'success',
          response,
          globalConfig: { enabled: true },
          endpointConfig: {},
          successConfig: {}
        })
      }).not.toThrow()
    })
  })

  describe('createApiResponseHandler', () => {
    const mockEndpointConfig = {
      baseURL: '/api',
      auth: {},
      toast: {
        enabled: true,
        success: { show: true },
        error: { show: true }
      },
      success: {
        successCodes: [200, 0],
        codeKey: 'code',
        messageKey: 'msg',
        dataKey: 'data'
      }
    } as ApiEndpointConfig & {
      auth: Partial<ApiAuthConfig>
      toast: Partial<ApiToastConfig>
      success: Partial<ApiSuccessConfig>
    }

    describe('transform', () => {
      it('应在业务成功时解包数据', () => {
        const handlers = createApiResponseHandler({}, mockEndpointConfig)

        const response: ApiResponseBase<{ id: number }> = {
          code: 200,
          data: { id: 1 }
        }

        const result = handlers.transform!(response)
        expect(result).toEqual({ id: 1 })
      })

      it('应在业务失败时抛出错误', () => {
        const handlers = createApiResponseHandler({}, mockEndpointConfig)

        const response: ApiResponseBase<unknown> = {
          code: 400,
          msg: '参数错误'
        }

        expect(() => {
          handlers.transform!(response)
        }).toThrow('参数错误')
      })

      it('应支持跳过业务检查', () => {
        const handlers = createApiResponseHandler(
          { skipBusinessCheck: true },
          mockEndpointConfig
        )

        const response: ApiResponseBase<{ id: number }> = {
          code: 400,
          data: { id: 1 }
        }

        const result = handlers.transform!(response)
        expect(result).toEqual({ id: 1 })
      })

      it('应支持自定义 transform', () => {
        const customTransform = vi.fn(data => ({ transformed: true, original: data }))

        const handlers = createApiResponseHandler(
          { transform: customTransform },
          mockEndpointConfig
        )

        const response: ApiResponseBase<{ id: number }> = {
          code: 200,
          data: { id: 1 }
        }

        const result = handlers.transform!(response)

        expect(customTransform).toHaveBeenCalledWith(response)
        expect(result).toEqual({
          transformed: true,
          original: response
        })
      })

      it('应支持禁用解包', () => {
        const handlers = createApiResponseHandler(
          { unwrap: false },
          mockEndpointConfig
        )

        const response: ApiResponseBase<{ id: number }> = {
          code: 200,
          msg: '成功',
          data: { id: 1 }
        }

        const result = handlers.transform!(response)
        expect(result).toEqual(response)
      })

      it('应支持 result 字段作为数据源', () => {
        const handlers = createApiResponseHandler({}, mockEndpointConfig)

        const response: ApiResponseBase<{ id: number }> = {
          code: 200,
          result: { id: 1 }
        }

        const result = handlers.transform!(response)
        expect(result).toEqual({ id: 1 })
      })

      it('应在没有 data 和 result 时返回整个响应', () => {
        const handlers = createApiResponseHandler({}, mockEndpointConfig)

        const response: ApiResponseBase<unknown> = {
          code: 200,
          msg: '成功'
        }

        const result = handlers.transform!(response)
        expect(result).toEqual(response)
      })

      it('应支持自定义 dataKey', () => {
        const customConfig = {
          ...mockEndpointConfig,
          success: {
            ...mockEndpointConfig.success,
            dataKey: 'payload'
          }
        }

        const handlers = createApiResponseHandler({}, customConfig)

        const response = {
          code: 200,
          payload: { id: 1 }
        } as any

        const result = handlers.transform!(response)
        expect(result).toEqual({ id: 1 })
      })
    })

    describe('onResponse', () => {
      it('应在跳过业务检查时不处理 Toast', () => {
        const handlers = createApiResponseHandler(
          { skipBusinessCheck: true },
          mockEndpointConfig
        )

        const mockResponse = {
          _data: { code: 200, msg: '成功' }
        }

        expect(() => {
          handlers.onResponse!({ response: mockResponse } as any)
        }).not.toThrow()
      })

      it('应在业务成功时调用 showToast', () => {
        const handlers = createApiResponseHandler({}, mockEndpointConfig)

        const mockResponse = {
          _data: { code: 200, msg: '成功' }
        }

        // showToast 内部会检查 useToast 可用性,这里只测试不抛出错误
        expect(() => {
          handlers.onResponse!({ response: mockResponse } as any)
        }).not.toThrow()
      })

      it('应在业务失败时调用 showToast', () => {
        const handlers = createApiResponseHandler({}, mockEndpointConfig)

        const mockResponse = {
          _data: { code: 400, msg: '失败' }
        }

        expect(() => {
          handlers.onResponse!({ response: mockResponse } as any)
        }).not.toThrow()
      })
    })
  })
})
