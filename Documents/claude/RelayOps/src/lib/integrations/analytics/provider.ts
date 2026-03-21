import { env } from '@/lib/config/env'

export interface AnalyticsProvider {
  track(event: string, properties?: Record<string, unknown>): void
  identify(userId: string, traits?: Record<string, unknown>): void
}

// Mock 模式：console.log 输出事件（开发/测试环境）
class ConsoleAnalyticsProvider implements AnalyticsProvider {
  track(event: string, properties?: Record<string, unknown>): void {
    console.log('[ANALYTICS MOCK] track', { event, properties })
  }

  identify(userId: string, traits?: Record<string, unknown>): void {
    console.log('[ANALYTICS MOCK] identify', { userId, traits })
  }
}

// Live 模式：Mixpanel 服务端 SDK
class MixpanelAnalyticsProvider implements AnalyticsProvider {
  private mixpanel: ReturnType<typeof import('mixpanel')['init']> | null = null

  private async getClient() {
    if (!this.mixpanel) {
      const Mixpanel = await import('mixpanel')
      const token = env.MIXPANEL_TOKEN
      if (!token) {
        throw new Error('MIXPANEL_TOKEN is not set')
      }
      this.mixpanel = Mixpanel.default.init(token)
    }
    return this.mixpanel
  }

  track(event: string, properties?: Record<string, unknown>): void {
    // 异步发送，不阻塞业务流程
    this.getClient()
      .then((client) => client.track(event, properties ?? {}))
      .catch(() => {
        // analytics 发送失败不应影响业务
      })
  }

  identify(userId: string, traits?: Record<string, unknown>): void {
    this.getClient()
      .then((client) => client.people.set(userId, traits ?? {}))
      .catch(() => {})
  }
}

// 单例缓存
let _provider: AnalyticsProvider | null = null

export function getAnalyticsProvider(): AnalyticsProvider {
  if (!_provider) {
    _provider =
      env.INTEGRATION_MODE === 'mock'
        ? new ConsoleAnalyticsProvider()
        : new MixpanelAnalyticsProvider()
  }
  return _provider
}
