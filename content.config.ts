import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        date: z.string().optional()
      })
    }),
    faq: defineCollection({
      type: 'page',
      source: 'faq/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string().optional()
      })
    }),
    tutorial: defineCollection({
      type: 'page',
      source: 'tutorial/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string().optional()
      })
    })
  }
})
