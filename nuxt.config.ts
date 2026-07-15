// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxt/content',
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'nuxt-auth-utils',
    'nuxt-og-image',
    'nuxt-charts'
  ],

  devtools: {
    enabled: true
  },

  app: {
    head: {
      htmlAttrs: { lang: 'id' },
      titleTemplate: '%s · MugiewDev',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0F172A' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' }
  },

  css: ['~/assets/css/main.css'],

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    name: 'MugiewDev',
    description: 'Platform website profesional untuk UMKM & eksportir Indonesia. Template siap pakai, domain, hosting, akademi ekspor, dan komunitas.',
    defaultLocale: 'id'
  },

  // Soft UI Evolution — navy + sky accent (see DESIGN.md)
  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: ''
  },

  content: {
    experimental: { nativeSqlite: true }
  },

  runtimeConfig: {
    // Server-only secrets — override with NUXT_* env vars
    session: {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      password: process.env.NUXT_SESSION_PASSWORD || ''
    },
    databaseUrl: process.env.NUXT_DATABASE_URL || 'file:./.data/mugiew.sqlite',
    resendApiKey: process.env.NUXT_RESEND_API_KEY || '',
    whatsappNumber: process.env.NUXT_WHATSAPP_NUMBER || '6281280080275',
    // QrisVIP / Otomatis VIP — QRIS only
    qrisvipUuid: process.env.NUXT_QRISVIP_UUID || '',
    qrisvipClient: process.env.NUXT_QRISVIP_CLIENT || '',
    qrisvipClientKey: process.env.NUXT_QRISVIP_CLIENT_KEY || '',
    qrisvipUsername: process.env.NUXT_QRISVIP_USERNAME || '',
    qrisvipExpireSeconds: Number(process.env.NUXT_QRISVIP_EXPIRE_SECONDS || 1200),
    qrisvipWebhookSecret: process.env.NUXT_QRISVIP_WEBHOOK_SECRET || '',
    qrisvipBaseUrl: process.env.NUXT_QRISVIP_BASE_URL || 'https://qris.otomatis.vip',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      siteName: 'MugiewDev',
      supportEmail: process.env.NUXT_PUBLIC_SUPPORT_EMAIL || 'support@mugiewdev.com',
      whatsappNumber: process.env.NUXT_PUBLIC_WHATSAPP_NUMBER || '6281280080275'
    }
  },

  routeRules: {
    // Marketing — prerender / SWR for speed + SEO
    '/': { prerender: true },
    '/templates': { swr: 3600 },
    '/templates/**': { swr: 3600 },
    '/jasa-pembuatan-website-**': { swr: 3600 },
    '/academy': { swr: 3600 },
    '/komunitas': { swr: 3600 },
    '/portofolio': { swr: 3600 },
    '/tutorial': { swr: 3600 },
    '/faq': { swr: 3600 },
    '/blog': { swr: 600 },
    '/blog/**': { swr: 600 },
    // Order flow — dynamic
    '/order/**': { ssr: true },
    // Auth + panel
    '/login': { ssr: true },
    '/panel/**': { ssr: true }
  },

  experimental: {
    viewTransition: true,
    payloadExtraction: true
  },

  compatibilityDate: '2026-06-30',

  nitro: {
    experimental: {
      openAPI: true
    },
    storage: {
      db: {
        driver: 'fs',
        base: './.data/storage'
      }
    }
  },

  typescript: {
    strict: true,
    typeCheck: false // enable in CI via `pnpm typecheck`
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  fonts: {
    families: [
      { name: 'Plus Jakarta Sans', provider: 'google', weights: [300, 400, 500, 600, 700] }
    ]
  },

  i18n: {
    locales: [
      { code: 'id', language: 'id-ID', name: 'Bahasa Indonesia', file: 'id.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' }
    ],
    defaultLocale: 'id',
    langDir: 'locales',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'mugiew_locale',
      redirectOn: 'root',
      alwaysRedirect: false
    },
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  },

  image: {
    quality: 80,
    format: ['webp', 'avif'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    }
  },

  // Nuxt 4 srcDir is `app/` — pinia resolves storesDirs from layer.app
  pinia: {
    storesDirs: ['./stores']
  },

  robots: {
    groups: [
      {
        userAgent: ['*'],
        allow: ['/'],
        disallow: ['/panel']
      }
    ]
  },

  sitemap: {
    autoLastmod: true
  }
})
