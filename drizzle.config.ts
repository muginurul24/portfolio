import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './server/database/schema/index.ts',
  out: './server/database/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.NUXT_DATABASE_URL?.replace('file:', '') || './.data/mugiew.sqlite'
  },
  strict: true,
  verbose: true
})
