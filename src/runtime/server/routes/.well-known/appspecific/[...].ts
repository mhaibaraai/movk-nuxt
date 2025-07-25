/**
 * @issues https://github.com/nuxt/nuxt/issues/31978#issuecomment-2900825080
 */
export default defineEventHandler(async (event) => {
  if (useRuntimeConfig().public.nodeEnv !== 'production')
    return
  await proxyRequest(event, event.path)
})
