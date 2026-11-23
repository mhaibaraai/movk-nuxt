const workersAiBaseUrl = /^https:\/\/api\.cloudflare\.com\/client\/v4\/accounts\/[0-9a-f]{32}\/ai\/v1\/?$/i

export default defineEventHandler((event) => {
  if (import.meta.dev || getRequestURL(event).pathname.replace(/\/+$/, '') !== '/api/ai-chat') return

  // The docs layer falls back to its default gateway when AI_BASE_URL is missing.
  const baseUrl: unknown = event.context.cloudflare?.env?.AI_BASE_URL
  if (typeof baseUrl !== 'string' || !workersAiBaseUrl.test(baseUrl)) {
    throw createError({ statusCode: 503, statusMessage: 'AI Chat is not configured.' })
  }
})
