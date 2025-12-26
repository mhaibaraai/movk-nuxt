import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { asSeoCollection } from '@nuxtjs/seo/content'

export default defineContentConfig({
  collections: {
    releases: defineCollection(asSeoCollection({
      type: 'page',
      source: 'releases.yml',
      schema: z.object({
        releases: z.string(),
        hero: z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          icon: z.string().optional(),
          links: z.array(z.object({
            label: z.string(),
            to: z.string().optional(),
            target: z.string().optional(),
            icon: z.string().optional()
          })).optional()
        }).optional()
      })
    }))
  }
})
