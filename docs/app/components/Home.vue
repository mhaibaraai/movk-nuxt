<script setup lang="ts">
import { homeCopy } from '../data/home'

const { locale, localePath } = useMovkI18n()
const appConfig = useAppConfig()
const copy = computed(() => homeCopy[locale.value === 'en' ? 'en' : 'zh-CN'])

const features = [
  { id: 'autoForm', to: '/docs/auto-form/quickstart', icon: 'i-lucide-list-checks' },
  { id: 'dataTable', to: '/docs/data-table', icon: 'i-lucide-table-2' },
  { id: 'components', to: '/docs/components/message-box', icon: 'i-lucide-blocks' },
  { id: 'api', to: '/docs/api', icon: 'i-lucide-plug' }
] as const
</script>

<template>
  <section class="border-b border-default bg-muted/35">
    <UContainer class="grid items-center gap-10 pt-12 pb-14 sm:pt-16 sm:pb-18 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 lg:py-20 xl:gap-16">
      <div>
        <h1 class="max-w-3xl font-sans text-[clamp(2rem,9.7vw,2.25rem)]/tight font-bold tracking-tight text-balance text-highlighted sm:text-5xl/tight lg:text-4xl/tight xl:text-5xl/tight 2xl:text-6xl/[1.12]">
          {{ copy.title }}
          <span v-if="copy.titleContinuation" class="block">{{ copy.titleContinuation }}</span>
        </h1>

        <p class="mt-5 max-w-xl text-base/relaxed text-pretty text-toned sm:text-lg/relaxed">
          {{ copy.description }}
        </p>

        <div class="mt-7 flex flex-wrap gap-3">
          <UButton
            :label="copy.getStarted"
            :to="localePath('/docs/getting-started')"
            trailing-icon="i-lucide-arrow-right"
            size="lg"
          />
          <UButton
            v-if="appConfig.github"
            :label="copy.viewSource"
            :to="appConfig.github.url"
            icon="i-simple-icons-github"
            color="neutral"
            variant="outline"
            size="lg"
            target="_blank"
          />
        </div>
      </div>

      <HomeRegistrationDemo :copy="copy.demo" />
    </UContainer>
  </section>

  <section>
    <UContainer class="py-12 sm:py-16 lg:py-20">
      <h2 class="font-sans text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
        {{ copy.featuresTitle }}
      </h2>

      <ul class="mt-6 grid gap-x-10 sm:grid-cols-2">
        <li v-for="feature in features" :key="feature.id" class="flex items-start gap-4 border-t border-default py-5 sm:py-6">
          <UIcon :name="feature.icon" class="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <h3>
              <NuxtLink
                :to="localePath(feature.to)"
                class="rounded-sm text-lg font-semibold text-highlighted underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                {{ copy.features[feature.id].title }}
              </NuxtLink>
            </h3>
            <p class="mt-1 text-sm/relaxed text-muted sm:text-base/relaxed">
              {{ copy.features[feature.id].description }}
            </p>
          </div>
        </li>
      </ul>
    </UContainer>
  </section>

  <section class="border-y border-default bg-muted/35">
    <UContainer class="py-12 sm:py-16 lg:py-20">
      <h2 class="font-sans text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
        {{ copy.setupTitle }}
      </h2>

      <div class="mt-6 grid gap-x-10 gap-y-7 sm:grid-cols-2">
        <div class="border-t border-default pt-5">
          <h3 class="text-lg font-semibold text-highlighted">
            Nuxt 4
          </h3>
          <p class="mt-1 text-muted">
            {{ copy.nuxtDescription }}
          </p>
          <UButton :label="copy.nuxtGuide" :to="localePath('/docs/getting-started/installation')" variant="link" class="mt-3 p-0" />
        </div>
        <div class="border-t border-default pt-5">
          <h3 class="text-lg font-semibold text-highlighted">
            Vue + Vite
          </h3>
          <p class="mt-1 text-muted">
            {{ copy.vueDescription }}
          </p>
          <UButton :label="copy.vueGuide" :to="localePath('/docs/getting-started/vue')" variant="link" class="mt-3 p-0" />
        </div>
      </div>

      <div class="mt-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-default pt-5">
        <p class="text-sm/relaxed text-muted">
          {{ copy.aiDescription }}
        </p>
        <UButton :label="copy.aiGuide" :to="localePath('/docs/getting-started/ai')" variant="link" class="p-0" />
      </div>
    </UContainer>
  </section>
</template>
